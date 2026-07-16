import pool from '~/config/db'

const jobModel = {
  // Lấy danh sách công việc với filter
  findAll: async (filters = {}) => {
    const {
      keyword,
      location,
      experience_level,
      employment_type,
      skill,
      min_salary,
      max_salary,
      category_id,
      limit = 5,
      offset = 0
    } = filters

    const conditions = []
    const params = []
    let paramIndex = 1

    conditions.push('jd.is_active = true')

    if (keyword) {
      conditions.push(`(jd.title ILIKE $${paramIndex} OR jd.description ILIKE $${paramIndex})`)
      params.push(`%${keyword}%`)
      paramIndex++
    }

    if (location) {
      conditions.push(`jd.location ILIKE $${paramIndex}`)
      params.push(`%${location}%`)
      paramIndex++
    }

    if (experience_level) {
      conditions.push(`jd.experience_level = $${paramIndex}`)
      params.push(experience_level)
      paramIndex++
    }

    if (employment_type) {
      conditions.push(`jd.employment_type = $${paramIndex}`)
      params.push(employment_type)
      paramIndex++
    }

    if (skill) {
      conditions.push(`jd.required_skills ? $${paramIndex}`)
      params.push(skill)
      paramIndex++
    }

    if (min_salary) {
      conditions.push(`(jd.salary_range->>'min')::numeric >= $${paramIndex}`)
      params.push(min_salary)
      paramIndex++
    }

    if (max_salary) {
      conditions.push(`(jd.salary_range->>'max')::numeric <= $${paramIndex}`)
      params.push(max_salary)
      paramIndex++
    }

    if (category_id) {
      conditions.push(`jd.category_id = $${paramIndex}`)
      params.push(category_id)
      paramIndex++
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`

    const countQuery = `
      SELECT COUNT(*) as total
      FROM job_descriptions jd
      ${whereClause}
    `
    const countParams = [...params]
    const countResult = await pool.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0]?.total || 0)

    const dataQuery = `
      SELECT jd.*, c.name as company_name, c.logo as company_logo, 
             c.address as company_address, c.id as company_id,
             cat.name as category_name, cat.slug as category_slug
      FROM job_descriptions jd
      LEFT JOIN companies c ON jd.company_id = c.id
      LEFT JOIN category_job cat ON jd.category_id = cat.id
      ${whereClause}
      ORDER BY jd.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `
    const dataParams = [...params, limit, offset]
    const result = await pool.query(dataQuery, dataParams)

    return {
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Lấy chi tiết công việc
  findById: async (id) => {
    const result = await pool.query(
      `SELECT jd.*, c.name as company_name, c.logo as company_logo, 
              c.address as company_address, c.description as company_description,
              c.culture_description as company_culture, c.id as company_id,
              cat.name as category_name, cat.slug as category_slug
       FROM job_descriptions jd
       LEFT JOIN companies c ON jd.company_id = c.id
       LEFT JOIN category_job cat ON jd.category_id = cat.id
       WHERE jd.id = $1 AND jd.is_active = true`,
      [id]
    )
    return result.rows[0]
  },

  // Lấy công việc theo công ty
  findByCompanyId: async (companyId) => {
    const result = await pool.query(
      `SELECT jd.*, c.name as company_name,
              cat.name as category_name, cat.slug as category_slug
       FROM job_descriptions jd
       LEFT JOIN companies c ON jd.company_id = c.id
       LEFT JOIN category_job cat ON jd.category_id = cat.id
       WHERE jd.company_id = $1 AND jd.is_active = true
       ORDER BY jd.created_at DESC`,
      [companyId]
    )
    return result.rows
  },

  // Lấy công việc nổi bật (mới nhất)
  findFeatured: async (limit = 6) => {
    const result = await pool.query(
      `SELECT jd.*, c.name as company_name, c.logo as company_logo,
              cat.name as category_name, cat.slug as category_slug
       FROM job_descriptions jd
       LEFT JOIN companies c ON jd.company_id = c.id
       LEFT JOIN category_job cat ON jd.category_id = cat.id
       WHERE jd.is_active = true
       ORDER BY jd.created_at DESC
       LIMIT $1`,
      [limit]
    )
    return result.rows
  },

  // Đếm tổng số công việc
  count: async () => {
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM job_descriptions WHERE is_active = true'
    )
    return parseInt(result.rows[0]?.total || 0)
  },

  // Lấy filter options
  getFilterOptions: async () => {
    const result = await pool.query(
      `SELECT 
        DISTINCT location,
        experience_level,
        employment_type
       FROM job_descriptions
       WHERE is_active = true`
    )

    const options = {
      locations: [],
      experience_levels: [],
      employment_types: []
    }

    result.rows.forEach(row => {
      if (row.location && !options.locations.includes(row.location)) {
        options.locations.push(row.location)
      }
      if (row.experience_level && !options.experience_levels.includes(row.experience_level)) {
        options.experience_levels.push(row.experience_level)
      }
      if (row.employment_type && !options.employment_types.includes(row.employment_type)) {
        options.employment_types.push(row.employment_type)
      }
    })

    const categoryResult = await pool.query(
      'SELECT id, name, slug FROM category_job WHERE is_active = true ORDER BY name ASC'
    )
    options.categories = categoryResult.rows

    return options
  },

  // Lấy danh sách kỹ năng (cho autocomplete)
  getSkills: async () => {
    const result = await pool.query('SELECT name FROM skills ORDER BY name')
    return result.rows.map(row => row.name)
  }
}

export default jobModel