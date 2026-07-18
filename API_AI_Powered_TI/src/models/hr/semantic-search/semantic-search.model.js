import pool from '~/config/db'

const semanticSearchModel = {
  // Lưu embedding cho application
  saveEmbedding: async (applicationId, embedding, contentType = 'full_text') => {
    const query = `
      INSERT INTO candidate_embeddings (candidate_id, embedding, content_type)
      VALUES ($1, $2::vector, $3)
      ON CONFLICT (candidate_id, content_type) 
      DO UPDATE SET embedding = $2::vector, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    const result = await pool.query(query, [applicationId, JSON.stringify(embedding), contentType])
    return result.rows[0]
  },

  // Tìm kiếm ngữ nghĩa (JOIN với applications và candidate_profiles)
  semanticSearch: async (embedding, limit = 20, threshold = 0.6) => {
    const query = `
      SELECT 
        ce.candidate_id as application_id,
        a.id as application_id,
        a.position as position_applied,
        a.status,
        a.overall_score,
        a.skills_match_score,
        a.culture_fit_score,
        a.retention_score,
        a.created_at,
        cp.id as candidate_profile_id,
        cp.name,
        cp.email,
        cp.phone,
        cp.cv_url,
        cp.parsed_data,
        cp.skills,
        1 - (ce.embedding <=> $1::vector) as similarity
      FROM candidate_embeddings ce
      JOIN applications a ON ce.candidate_id = a.id
      JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
      WHERE 1 - (ce.embedding <=> $1::vector) > $2
      AND ce.content_type = 'full_text'
      ORDER BY ce.embedding <=> $1::vector
      LIMIT $3
    `
    const result = await pool.query(query, [JSON.stringify(embedding), threshold, limit])
    return result.rows
  },

  // Tìm kiếm ngữ nghĩa với filter
  semanticSearchWithFilter: async (embedding, filters = {}, limit = 20, threshold = 0.6) => {
    const { companyId, status, minScore, maxScore, startDate, endDate } = filters

    let conditions = []
    const params = []
    let paramIndex = 1

    // Embedding và threshold
    conditions.push(`1 - (ce.embedding <=> $${paramIndex}::vector) > $${paramIndex + 1}`)
    params.push(JSON.stringify(embedding), threshold)
    paramIndex += 2

    // Company ID
    if (companyId) {
      conditions.push(`a.company_id = $${paramIndex}`)
      params.push(companyId)
      paramIndex++
    }

    // Filter status
    if (status) {
      conditions.push(`a.status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    // Filter score
    if (minScore !== undefined && minScore !== null) {
      conditions.push(`a.overall_score >= $${paramIndex}`)
      params.push(minScore)
      paramIndex++
    }
    if (maxScore !== undefined && maxScore !== null) {
      conditions.push(`a.overall_score <= $${paramIndex}`)
      params.push(maxScore)
      paramIndex++
    }

    // Filter date
    if (startDate) {
      conditions.push(`a.created_at::date >= $${paramIndex}`)
      params.push(startDate)
      paramIndex++
    }
    if (endDate) {
      conditions.push(`a.created_at::date <= $${paramIndex}`)
      params.push(endDate)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT 
        ce.candidate_id as application_id,
        a.id as application_id,
        a.position as position_applied,
        a.status,
        a.overall_score,
        a.skills_match_score,
        a.culture_fit_score,
        a.retention_score,
        a.created_at,
        cp.id as candidate_profile_id,
        cp.name,
        cp.email,
        cp.phone,
        cp.cv_url,
        cp.parsed_data,
        cp.skills,
        1 - (ce.embedding <=> $1::vector) as similarity
      FROM candidate_embeddings ce
      JOIN applications a ON ce.candidate_id = a.id
      JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
      ${whereClause}
      AND ce.content_type = 'full_text'
      ORDER BY ce.embedding <=> $1::vector
      LIMIT $${paramIndex}
    `
    params.push(limit)

    const result = await pool.query(query, params)
    return result.rows
  },

  // Lấy tất cả application IDs theo company
  getApplicationIdsByCompany: async (companyId) => {
    const result = await pool.query(
      'SELECT id FROM applications WHERE company_id = $1',
      [companyId]
    )
    return result.rows
  },

  // Lấy tất cả embedding của application
  getApplicationEmbeddings: async (applicationId) => {
    const result = await pool.query(
      'SELECT * FROM candidate_embeddings WHERE candidate_id = $1',
      [applicationId]
    )
    return result.rows
  },

  // Xóa embedding
  deleteEmbedding: async (applicationId, contentType = null) => {
    let query = 'DELETE FROM candidate_embeddings WHERE candidate_id = $1'
    const params = [applicationId]

    if (contentType) {
      query += ' AND content_type = $2'
      params.push(contentType)
    }

    await pool.query(query, params)
    return true
  },

  // Kiểm tra embedding đã tồn tại chưa
  hasEmbedding: async (applicationId) => {
    const result = await pool.query(
      'SELECT id FROM candidate_embeddings WHERE candidate_id = $1',
      [applicationId]
    )
    return result.rows.length > 0
  }
}

export default semanticSearchModel