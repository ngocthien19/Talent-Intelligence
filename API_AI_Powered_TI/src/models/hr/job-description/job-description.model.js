import pool from '~/config/db.js'

const jobDescriptionModel = {
  // Tạo JD mới
  create: async (data) => {
    const {
      companyId,
      title,
      description,
      requirements,
      benefits,
      requiredSkills,
      niceToHaveSkills,
      experienceLevel,
      employmentType,
      location,
      salaryRange,
      isActive = true
    } = data

    const query = `
      INSERT INTO job_descriptions (
        company_id, title, description, requirements, benefits,
        required_skills, nice_to_have_skills, experience_level,
        employment_type, location, salary_range, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `

    const result = await pool.query(query, [
      companyId,
      title,
      description,
      requirements,
      benefits,
      requiredSkills ? JSON.stringify(requiredSkills) : '[]',
      niceToHaveSkills ? JSON.stringify(niceToHaveSkills) : '[]',
      experienceLevel,
      employmentType,
      location,
      salaryRange ? JSON.stringify(salaryRange) : null,
      isActive
    ])

    return result.rows[0]
  },

  // Lấy danh sách JD
  getList: async (filters) => {
    const {
      companyId,
      keyword,
      experienceLevel,
      employmentType,
      isActive,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      limit = 20,
      offset = 0
    } = filters

    const conditions = []
    const params = []
    let paramIndex = 1

    conditions.push(`company_id = $${paramIndex}`)
    params.push(companyId)
    paramIndex++

    if (keyword) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`)
      params.push(`%${keyword}%`)
      paramIndex++
    }

    if (experienceLevel) {
      conditions.push(`experience_level = $${paramIndex}`)
      params.push(experienceLevel)
      paramIndex++
    }

    if (employmentType) {
      conditions.push(`employment_type = $${paramIndex}`)
      params.push(employmentType)
      paramIndex++
    }

    if (isActive !== undefined && isActive !== null) {
      conditions.push(`is_active = $${paramIndex}`)
      params.push(isActive)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countQuery = `
      SELECT COUNT(*) as total
      FROM job_descriptions
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || 0)

    const sortMap = {
      title: 'title',
      created_at: 'created_at',
      updated_at: 'updated_at'
    }
    const sortField = sortMap[sortBy] || 'created_at'

    const limitParam = parseInt(limit)
    const offsetParam = parseInt(offset)

    const dataQuery = `
      SELECT id, title, description, requirements, benefits,
             required_skills, nice_to_have_skills,
             experience_level, employment_type, location,
             salary_range, is_active,
             created_at, updated_at
      FROM job_descriptions
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

  // Lấy chi tiết JD
  getById: async (id, companyId) => {
    const result = await pool.query(
      `SELECT j.*, c.name as company_name
       FROM job_descriptions j
       LEFT JOIN companies c ON j.company_id = c.id
       WHERE j.id = $1 AND j.company_id = $2`,
      [id, companyId]
    )
    return result.rows[0]
  },

  // Cập nhật JD
  update: async (id, companyId, data) => {
    const fields = []
    const params = []
    let paramIndex = 1

    const fieldMap = {
      title: 'title',
      description: 'description',
      requirements: 'requirements',
      benefits: 'benefits',
      requiredSkills: 'required_skills',
      niceToHaveSkills: 'nice_to_have_skills',
      experienceLevel: 'experience_level',
      employmentType: 'employment_type',
      location: 'location',
      salaryRange: 'salary_range',
      isActive: 'is_active'
    }

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        let value = data[key]

        if (key === 'requiredSkills' || key === 'niceToHaveSkills') {
          value = JSON.stringify(value || [])
        }

        if (key === 'salaryRange') {
          value = JSON.stringify(value)
        }

        fields.push(`${dbField} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    }

    if (fields.length === 0) {
      const result = await pool.query(
        'SELECT * FROM job_descriptions WHERE id = $1 AND company_id = $2',
        [id, companyId]
      )
      return result.rows[0]
    }

    params.push(id, companyId)
    const query = `
      UPDATE job_descriptions
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
      RETURNING *
    `

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  // Xóa JD
  delete: async (id, companyId) => {
    const result = await pool.query(
      `DELETE FROM job_descriptions
       WHERE id = $1 AND company_id = $2
       RETURNING *`,
      [id, companyId]
    )
    return result.rows[0]
  },

  // Lấy số lượng JD
  getTotalCount: async (companyId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM job_descriptions WHERE company_id = $1',
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Kiểm tra JD có tồn tại không
  exists: async (id, companyId) => {
    const result = await pool.query(
      'SELECT id FROM job_descriptions WHERE id = $1 AND company_id = $2',
      [id, companyId]
    )
    return result.rows.length > 0
  }
}

export default jobDescriptionModel