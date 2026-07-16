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
      categoryId,
      isActive = true
    } = data

    const query = `
      INSERT INTO job_descriptions (
        company_id, title, description, requirements, benefits,
        required_skills, nice_to_have_skills, experience_level,
        employment_type, location, salary_range, category_id, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      categoryId || null,
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
      categoryId,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      limit = 20,
      offset = 0
    } = filters

    const conditions = []
    const params = []
    let paramIndex = 1

    conditions.push(`j.company_id = $${paramIndex}`)
    params.push(companyId)
    paramIndex++

    if (keyword) {
      conditions.push(`(j.title ILIKE $${paramIndex} OR j.description ILIKE $${paramIndex})`)
      params.push(`%${keyword}%`)
      paramIndex++
    }

    if (experienceLevel) {
      conditions.push(`j.experience_level = $${paramIndex}`)
      params.push(experienceLevel)
      paramIndex++
    }

    if (employmentType) {
      conditions.push(`j.employment_type = $${paramIndex}`)
      params.push(employmentType)
      paramIndex++
    }

    if (isActive !== undefined && isActive !== null) {
      conditions.push(`j.is_active = $${paramIndex}`)
      params.push(isActive)
      paramIndex++
    }

    if (categoryId) {
      conditions.push(`j.category_id = $${paramIndex}`)
      params.push(categoryId)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countQuery = `
      SELECT COUNT(*) as total
      FROM job_descriptions j
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || 0)

    const sortMap = {
      title: 'j.title',
      created_at: 'j.created_at',
      updated_at: 'j.updated_at'
    }
    const sortField = sortMap[sortBy] || 'j.created_at'

    const limitParam = parseInt(limit)
    const offsetParam = parseInt(offset)

    const dataQuery = `
      SELECT j.id, j.title, j.description, j.requirements, j.benefits,
             j.required_skills, j.nice_to_have_skills,
             j.experience_level, j.employment_type, j.location,
             j.salary_range, j.is_active, j.category_id,
             j.created_at, j.updated_at,
             c.name as company_name,
             cat.name as category_name, cat.slug as category_slug
      FROM job_descriptions j
      LEFT JOIN companies c ON j.company_id = c.id
      LEFT JOIN category_job cat ON j.category_id = cat.id
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

  // Lấy chi tiết JD (có join với category)
  getById: async (id, companyId) => {
    const result = await pool.query(
      `SELECT j.*, c.name as company_name,
              cat.name as category_name, cat.slug as category_slug
       FROM job_descriptions j
       LEFT JOIN companies c ON j.company_id = c.id
       LEFT JOIN category_job cat ON j.category_id = cat.id
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
      categoryId: 'category_id',
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
  },

  // Bulk delete
  bulkDelete: async (ids, companyId) => {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
    const params = [...ids, companyId]

    const query = `
      DELETE FROM job_descriptions
      WHERE id IN (${placeholders})
      AND company_id = $${ids.length + 1}
      RETURNING id, title
    `

    const result = await pool.query(query, params)
    return result.rows
  },

  // Bulk update status
  bulkUpdateStatus: async (ids, companyId, isActive) => {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
    const params = [...ids, isActive, companyId]

    const query = `
      UPDATE job_descriptions
      SET is_active = $${ids.length + 1}, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
      AND company_id = $${ids.length + 2}
      RETURNING id, title, is_active
    `

    const result = await pool.query(query, params)
    return result.rows
  },

  // Kiểm tra tất cả ids có tồn tại và thuộc company không
  checkIdsExist: async (ids, companyId) => {
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ')
    const params = [...ids, companyId]

    const query = `
      SELECT id FROM job_descriptions
      WHERE id IN (${placeholders})
      AND company_id = $${ids.length + 1}
    `

    const result = await pool.query(query, params)
    return result.rows.map(row => row.id)
  }
}

export default jobDescriptionModel