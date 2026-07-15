import pool from '~/config/db.js'

const candidateManagementModel = {
  // Lấy danh sách ứng viên với filter, search, pagination
  getCandidates: async (filters) => {
    const {
      companyId,
      status,
      keyword,
      minScore,
      maxScore,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      limit = 20,
      offset = 0
    } = filters

    const conditions = []
    const params = []
    let paramIndex = 1

    conditions.push(`c.company_id = $${paramIndex}`)
    params.push(companyId)
    paramIndex++

    if (status) {
      conditions.push(`c.status = $${paramIndex}`)
      params.push(status)
      paramIndex++
    }

    if (keyword) {
      conditions.push(`(c.name ILIKE $${paramIndex} 
                OR c.email ILIKE $${paramIndex} 
                OR c.position_applied ILIKE $${paramIndex}
                OR c.phone ILIKE $${paramIndex})`)
      params.push(`%${keyword}%`)
      paramIndex++
    }

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

    const countQuery = `
      SELECT COUNT(*) as total
      FROM candidates c
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || 0)

    const sortMap = {
      name: 'c.name',
      email: 'c.email',
      position_applied: 'c.position_applied',
      overall_score: 'c.overall_score',
      status: 'c.status',
      created_at: 'c.created_at'
    }
    const sortField = sortMap[sortBy] || 'c.created_at'

    const limitParam = parseInt(limit)
    const offsetParam = parseInt(offset)

    const dataQuery = `
      SELECT c.id, c.name, c.email, c.phone, c.address,
             c.position_applied, c.cover_letter, c.source,
             c.cv_url, c.cv_original_name, c.cv_file_size,
             c.overall_score, c.skills_match_score, c.culture_fit_score, c.retention_score,
             c.status, c.is_notified, c.report_sent_at,
             c.created_at, c.updated_at,
             jd.title as job_title, jd.location as job_location,
             comp.name as company_name
      FROM candidates c
      LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    const dataParams = [...params, limitParam, offsetParam]
    const result = await pool.query(dataQuery, dataParams)

    return {
      data: result.rows,
      pagination: {
        total,
        limit: limitParam,
        offset: offsetParam,
        totalPages: Math.ceil(total / limitParam)
      }
    }
  },

  // Lấy chi tiết ứng viên
  getCandidateDetail: async (candidateId, companyId) => {
    const result = await pool.query(
      `SELECT c.*, 
              jd.title as job_title, jd.description as job_description,
              jd.requirements, jd.benefits, jd.location as job_location,
              jd.required_skills, jd.nice_to_have_skills,
              jd.experience_level, jd.employment_type, jd.salary_range,
              comp.name as company_name, comp.culture_description,
              comp.industry, comp.address as company_address,
              u.fullname as hr_name, u.email as hr_email,
              r.name as role_name,
              a.id as analysis_id, a.result as analysis_result, a.score as analysis_score,
              a.explanation as analysis_explanation, a.strengths, a.weaknesses, a.suggestions
       FROM candidates c
       LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
       LEFT JOIN companies comp ON c.company_id = comp.id
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN analyses a ON c.id = a.candidate_id AND a.analysis_type = 'full_analysis'
       WHERE c.id = $1 AND c.company_id = $2`,
      [candidateId, companyId]
    )
    return result.rows[0]
  },

  // Cập nhật trạng thái
  updateCandidateStatus: async (candidateId, status) => {
    const result = await pool.query(
      `UPDATE candidates 
       SET status = $1, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, candidateId]
    )
    return result.rows[0]
  },

  // Xóa ứng viên
  deleteCandidate: async (candidateId, companyId) => {
    const result = await pool.query(
      `DELETE FROM candidates 
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [candidateId, companyId]
    )
    return result.rows[0]
  },

  getTotalCount: async (companyId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM candidates WHERE company_id = $1',
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getCountByStatus: async (companyId, status) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM candidates 
       WHERE company_id = $1 AND status = $2`,
      [companyId, status]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getTodayNewCount: async (companyId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM candidates 
       WHERE company_id = $1 
       AND created_at::date = CURRENT_DATE`,
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getWeekNewCount: async (companyId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM candidates 
       WHERE company_id = $1 
       AND created_at >= NOW() - INTERVAL '7 days'`,
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  }
}

export default candidateManagementModel