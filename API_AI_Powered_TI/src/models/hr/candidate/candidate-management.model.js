import pool from '~/config/db.js'

const candidateManagementModel = {
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

    // Điều kiện company_id
    conditions.push(`a.company_id = $${paramIndex}`)
    params.push(companyId)
    paramIndex++

    // Điều kiện status
    if (status) {
      conditions.push(`a.status = $${paramIndex}::candidate_status`)
      params.push(status)
      paramIndex++
    }

    // Tìm kiếm theo keyword (tên, email, vị trí)
    if (keyword) {
      conditions.push(`(
        cp.name ILIKE $${paramIndex} OR 
        cp.email ILIKE $${paramIndex} OR 
        a.position ILIKE $${paramIndex}
      )`)
      params.push(`%${keyword}%`)
      paramIndex++
    }

    // Điểm số
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

    // Ngày tháng
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

    // Đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(*) as total
      FROM applications a
      LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || 0)

    // Mapping sort field
    const sortMap = {
      name: 'cp.name',
      email: 'cp.email',
      position_applied: 'a.position',
      overall_score: 'a.overall_score',
      status: 'a.status',
      created_at: 'a.created_at'
    }
    const sortField = sortMap[sortBy] || 'a.created_at'

    const limitParam = parseInt(limit)
    const offsetParam = parseInt(offset)

    // Lấy dữ liệu
    const dataQuery = `
      SELECT 
        a.id,
        cp.name,
        cp.email,
        cp.phone,
        cp.address,
        a.position as position_applied,
        a.cover_letter_text as cover_letter,
        a.source,
        a.overall_score,
        a.skills_match_score,
        a.culture_fit_score,
        a.retention_score,
        a.status,
        a.is_notified,
        a.report_sent_at,
        a.created_at,
        a.updated_at,
        jd.title as job_title,
        jd.location as job_location,
        comp.name as company_name
      FROM applications a
      LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
      LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
      LEFT JOIN companies comp ON a.company_id = comp.id
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

  getCandidateDetail: async (candidateId, companyId) => {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.company_id,
        a.job_description_id,
        a.candidate_profile_id,
        a.position,
        a.cover_letter_text,
        a.source,
        a.overall_score,
        a.skills_match_score,
        a.culture_fit_score,
        a.retention_score,
        a.status,
        a.is_notified,
        a.report_sent_at,
        a.created_at,
        a.updated_at,
        cp.name,
        cp.email,
        cp.phone,
        cp.address,
        cp.avatar,
        cp.cv_url,
        cp.cv_original_name,
        cp.cv_file_size,
        cp.skills,
        cp.parsed_data,
        jd.title as job_title,
        jd.description as job_description,
        jd.requirements,
        jd.benefits,
        jd.location as job_location,
        jd.required_skills,
        jd.nice_to_have_skills,
        jd.experience_level,
        jd.employment_type,
        jd.salary_range,
        comp.name as company_name,
        comp.culture_description,
        comp.industry,
        comp.address as company_address,
        u.fullname as hr_name,
        u.email as hr_email
      FROM applications a
      LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
      LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
      LEFT JOIN companies comp ON a.company_id = comp.id
      LEFT JOIN users u ON a.user_id = u.id
      WHERE a.id = $1 AND a.company_id = $2`,
      [candidateId, companyId]
    )
    return result.rows[0]
  },

  updateCandidateStatus: async (candidateId, status) => {
    const result = await pool.query(
      `UPDATE applications 
       SET status = $1::candidate_status,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, candidateId]
    )
    return result.rows[0]
  },

  updateStatusBulk: async (ids, status) => {
    const result = await pool.query(
      `UPDATE applications 
       SET status = $1::candidate_status,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ANY($2::uuid[])
       RETURNING id, status, updated_at`,
      [status, ids]
    )
    return result.rows
  },

  deleteCandidate: async (candidateId, companyId) => {
    const result = await pool.query(
      `DELETE FROM applications 
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [candidateId, companyId]
    )
    return result.rows[0]
  },

  deleteBulk: async (ids) => {
    const result = await pool.query(
      `DELETE FROM applications 
       WHERE id = ANY($1::uuid[])
       RETURNING id`,
      [ids]
    )
    return result.rows
  },

  getExistingIds: async (ids, companyId) => {
    if (!ids || ids.length === 0) return []

    const result = await pool.query(
      `SELECT id FROM applications 
       WHERE id = ANY($1::uuid[]) AND company_id = $2`,
      [ids, companyId]
    )
    return result.rows.map(row => row.id)
  },

  getTotalCount: async (companyId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE company_id = $1',
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getCountByStatus: async (companyId, status) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM applications 
       WHERE company_id = $1 AND status = $2::candidate_status`,
      [companyId, status]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getTodayNewCount: async (companyId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM applications 
       WHERE company_id = $1 
       AND created_at::date = CURRENT_DATE`,
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getWeekNewCount: async (companyId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM applications 
       WHERE company_id = $1 
       AND created_at >= NOW() - INTERVAL '7 days'`,
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getAllStatusCounts: async (companyId) => {
    const result = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM applications 
       WHERE company_id = $1 
       GROUP BY status`,
      [companyId]
    )
    const counts = {}
    result.rows.forEach(row => {
      counts[row.status] = parseInt(row.count)
    })
    return counts
  },

  getAverageScores: async (companyId) => {
    const result = await pool.query(
      `SELECT 
        AVG(overall_score) as overall,
        AVG(skills_match_score) as skills_match,
        AVG(culture_fit_score) as culture_fit,
        AVG(retention_score) as retention
       FROM applications 
       WHERE company_id = $1 
       AND overall_score IS NOT NULL`,
      [companyId]
    )
    const row = result.rows[0] || {}
    return {
      overall: Math.round(row.overall || 0),
      skillsMatch: Math.round(row.skills_match || 0),
      cultureFit: Math.round(row.culture_fit || 0),
      retention: Math.round(row.retention || 0)
    }
  },

  getTopSkills: async (companyId, limit = 10) => {
    const result = await pool.query(
      `SELECT 
        skill,
        COUNT(*) as count
       FROM applications a,
       LATERAL jsonb_array_elements_text(
         COALESCE(a.required_skills, '[]'::jsonb)
       ) AS skill
       WHERE a.company_id = $1
       GROUP BY skill
       ORDER BY count DESC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  getRecentCandidates: async (companyId, limit = 5) => {
    const result = await pool.query(
      `SELECT 
        a.id,
        cp.name,
        cp.email,
        a.position as position_applied,
        a.status,
        a.overall_score,
        a.created_at
       FROM applications a
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.company_id = $1
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  }
}

export default candidateManagementModel