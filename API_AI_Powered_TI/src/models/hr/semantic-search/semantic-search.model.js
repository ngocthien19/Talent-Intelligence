import pool from '~/config/db'

const semanticSearchModel = {
  // Lưu embedding cho candidate
  saveEmbedding: async (candidateId, embedding, contentType = 'full_text') => {
    const query = `
      INSERT INTO candidate_embeddings (candidate_id, embedding, content_type)
      VALUES ($1, $2::vector, $3)
      ON CONFLICT (candidate_id, content_type) 
      DO UPDATE SET embedding = $2::vector, updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `
    const result = await pool.query(query, [candidateId, JSON.stringify(embedding), contentType])
    return result.rows[0]
  },

  // Tìm kiếm ngữ nghĩa
  semanticSearch: async (embedding, limit = 20, threshold = 0.6) => {
    const query = `
      SELECT 
        ce.candidate_id,
        c.name,
        c.email,
        c.phone,
        c.position_applied,
        c.overall_score,
        c.skills_match_score,
        c.culture_fit_score,
        c.retention_score,
        c.status,
        c.created_at,
        c.cv_url,
        c.parsed_data,
        1 - (ce.embedding <=> $1::vector) as similarity
      FROM candidate_embeddings ce
      JOIN candidates c ON ce.candidate_id = c.id
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
      conditions.push(`c.company_id = $${paramIndex}`)
      params.push(companyId)
      paramIndex++
    }

    // Filter status
    if (status) {
      conditions.push(`c.status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    // Filter score
    if (minScore !== undefined && minScore !== null) {
      conditions.push(`c.overall_score >= $${paramIndex}`)
      params.push(minScore)
      paramIndex++
    }
    if (maxScore !== undefined && maxScore !== null) {
      conditions.push(`c.overall_score <= $${paramIndex}`)
      params.push(maxScore)
      paramIndex++
    }

    // Filter date
    if (startDate) {
      conditions.push(`c.created_at::date >= $${paramIndex}`)
      params.push(startDate)
      paramIndex++
    }
    if (endDate) {
      conditions.push(`c.created_at::date <= $${paramIndex}`)
      params.push(endDate)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT 
        ce.candidate_id,
        c.name,
        c.email,
        c.phone,
        c.position_applied,
        c.overall_score,
        c.skills_match_score,
        c.culture_fit_score,
        c.retention_score,
        c.status,
        c.created_at,
        c.cv_url,
        c.parsed_data,
        1 - (ce.embedding <=> $1::vector) as similarity
      FROM candidate_embeddings ce
      JOIN candidates c ON ce.candidate_id = c.id
      ${whereClause}
      AND ce.content_type = 'full_text'
      ORDER BY ce.embedding <=> $1::vector
      LIMIT $${paramIndex}
    `
    params.push(limit)

    const result = await pool.query(query, params)
    return result.rows
  },

  // Lấy tất cả candidate IDs theo company
  getCandidateIdsByCompany: async (companyId) => {
    const result = await pool.query(
      'SELECT id FROM candidates WHERE company_id = $1',
      [companyId]
    )
    return result.rows
  },

  // Lấy tất cả embedding của candidate
  getCandidateEmbeddings: async (candidateId) => {
    const result = await pool.query(
      'SELECT * FROM candidate_embeddings WHERE candidate_id = $1',
      [candidateId]
    )
    return result.rows
  },

  // Xóa embedding
  deleteEmbedding: async (candidateId, contentType = null) => {
    let query = 'DELETE FROM candidate_embeddings WHERE candidate_id = $1'
    const params = [candidateId]

    if (contentType) {
      query += ' AND content_type = $2'
      params.push(contentType)
    }

    await pool.query(query, params)
    return true
  },

  // Kiểm tra embedding đã tồn tại chưa
  hasEmbedding: async (candidateId) => {
    const result = await pool.query(
      'SELECT id FROM candidate_embeddings WHERE candidate_id = $1',
      [candidateId]
    )
    return result.rows.length > 0
  }
}

export default semanticSearchModel