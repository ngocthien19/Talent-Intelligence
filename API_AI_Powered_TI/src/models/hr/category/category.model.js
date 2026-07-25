import pool from '~/config/db'
import slugify from 'slugify'

const categoryModel = {
  create: async (data) => {
    const {
      companyId,
      name,
      description,
      isActive = true
    } = data

    const slug = slugify(name, { lower: true, strict: true })

    const query = `
      INSERT INTO category_job (
        company_id, name, slug, description, is_active
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `

    const result = await pool.query(query, [
      companyId, name, slug, description, isActive
    ])

    return result.rows[0]
  },

  getList: async (filters) => {
    const {
      companyId,
      isActive,
      keyword,
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

    conditions.push(`company_id = $${paramIndex}`)
    params.push(companyId)
    paramIndex++

    if (isActive !== undefined && isActive !== null) {
      conditions.push(`is_active = $${paramIndex}`)
      params.push(isActive)
      paramIndex++
    }

    if (keyword) {
      conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`)
      params.push(`%${keyword}%`)
      paramIndex++
    }

    // Filter theo ngày tạo
    if (startDate) {
      conditions.push(`created_at::date >= $${paramIndex}`)
      params.push(startDate)
      paramIndex++
    }
    if (endDate) {
      conditions.push(`created_at::date <= $${paramIndex}`)
      params.push(endDate)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(*) as total
      FROM category_job
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || 0)

    // Mapping sort field
    const sortMap = {
      name: 'name',
      is_active: 'is_active',
      created_at: 'created_at',
      updated_at: 'updated_at'
    }
    const sortField = sortMap[sortBy] || 'created_at'

    const dataQuery = `
      SELECT id, name, slug, description, is_active,
             created_at, updated_at
      FROM category_job
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
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

  getById: async (id, companyId) => {
    const result = await pool.query(
      'SELECT * FROM category_job WHERE id = $1 AND company_id = $2',
      [id, companyId]
    )
    return result.rows[0]
  },

  getBySlug: async (slug, companyId) => {
    const result = await pool.query(
      'SELECT * FROM category_job WHERE slug = $1 AND company_id = $2',
      [slug, companyId]
    )
    return result.rows[0]
  },

  update: async (id, companyId, data) => {
    const fields = []
    const params = []
    let paramIndex = 1

    const fieldMap = {
      name: 'name',
      description: 'description',
      isActive: 'is_active'
    }

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        let value = data[key]
        fields.push(`${dbField} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    }

    if (data.name) {
      const slug = slugify(data.name, { lower: true, strict: true })
      fields.push(`slug = $${paramIndex}`)
      params.push(slug)
      paramIndex++
    }

    if (fields.length === 0) {
      const result = await pool.query(
        'SELECT * FROM category_job WHERE id = $1 AND company_id = $2',
        [id, companyId]
      )
      return result.rows[0]
    }

    params.push(id, companyId)
    const query = `
      UPDATE category_job
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex} AND company_id = $${paramIndex + 1}
      RETURNING *
    `

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  // Cập nhật trạng thái (single)
  updateStatus: async (id, companyId, isActive) => {
    const result = await pool.query(
      `UPDATE category_job
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3
       RETURNING *`,
      [isActive, id, companyId]
    )
    return result.rows[0]
  },

  // Cập nhật trạng thái hàng loạt (bulk)
  updateStatusBulk: async (ids, companyId, isActive) => {
    const result = await pool.query(
      `UPDATE category_job
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = ANY($2::uuid[]) AND company_id = $3
       RETURNING id, is_active, updated_at`,
      [isActive, ids, companyId]
    )
    return result.rows
  },

  // Xóa category (single)
  delete: async (id, companyId) => {
    const result = await pool.query(
      'DELETE FROM category_job WHERE id = $1 AND company_id = $2 RETURNING *',
      [id, companyId]
    )
    return result.rows[0]
  },

  // Xóa hàng loạt (bulk)
  deleteBulk: async (ids, companyId) => {
    const result = await pool.query(
      'DELETE FROM category_job WHERE id = ANY($1::uuid[]) AND company_id = $2 RETURNING id',
      [ids, companyId]
    )
    return result.rows
  },

  getDropdown: async (companyId) => {
    const result = await pool.query(
      `SELECT id, name, slug FROM category_job
       WHERE company_id = $1 AND is_active = true
       ORDER BY name ASC`,
      [companyId]
    )
    return result.rows
  },

  exists: async (id, companyId) => {
    const result = await pool.query(
      'SELECT id FROM category_job WHERE id = $1 AND company_id = $2',
      [id, companyId]
    )
    return result.rows.length > 0
  },

  existsByName: async (name, companyId, excludeId = null) => {
    let query = 'SELECT id FROM category_job WHERE name = $1 AND company_id = $2'
    const params = [name, companyId]

    if (excludeId) {
      query += ' AND id != $3'
      params.push(excludeId)
    }

    const result = await pool.query(query, params)
    return result.rows.length > 0
  },

  // Lấy thống kê
  getStats: async (companyId) => {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
        COUNT(CASE WHEN created_at::date = CURRENT_DATE THEN 1 END) as created_today,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as created_this_week
       FROM category_job
       WHERE company_id = $1`,
      [companyId]
    )
    return result.rows[0] || {
      total: 0,
      active: 0,
      inactive: 0,
      created_today: 0,
      created_this_week: 0
    }
  }
}

export default categoryModel