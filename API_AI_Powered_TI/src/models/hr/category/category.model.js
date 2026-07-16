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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const countQuery = `
      SELECT COUNT(*) as total
      FROM category_job
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || 0)

    const dataQuery = `
      SELECT id, name, slug, description, is_active,
             created_at, updated_at
      FROM category_job
      ${whereClause}
      ORDER BY name ASC
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

  delete: async (id, companyId) => {
    const result = await pool.query(
      'DELETE FROM category_job WHERE id = $1 AND company_id = $2 RETURNING *',
      [id, companyId]
    )
    return result.rows[0]
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
  }
}

export default categoryModel