import pool from '~/config/db.js'

const profileModel = {
  // Lấy thông tin công ty
  getCompany: async (companyId) => {
    const result = await pool.query(
      `SELECT id, name, description, culture_description,
              industry, website, logo, banner, address, size,
              is_active, created_at, updated_at
       FROM companies
       WHERE id = $1`,
      [companyId]
    )
    return result.rows[0]
  },

  // Cập nhật thông tin công ty
  updateCompany: async (companyId, data) => {
    const fields = []
    const params = []
    let paramIndex = 1

    const fieldMap = {
      name: 'name',
      description: 'description',
      cultureDescription: 'culture_description',
      industry: 'industry',
      website: 'website',
      logo: 'logo',
      banner: 'banner',
      address: 'address',
      size: 'size',
      isActive: 'is_active'
    }

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        let value = data[key]
        if (key === 'logo' || key === 'banner') {
          value = JSON.stringify(value)
        }
        fields.push(`${dbField} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    }

    if (fields.length === 0) {
      const result = await pool.query(
        'SELECT * FROM companies WHERE id = $1',
        [companyId]
      )
      return result.rows[0]
    }

    params.push(companyId)
    const query = `
      UPDATE companies
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  // Lấy thông tin HR
  getHRProfile: async (userId) => {
    const result = await pool.query(
      `SELECT u.id, u.email, u.fullname, u.phone, u.address,
              u.avatar, u.role_id, u.company_id, u.is_active,
              u.created_at, u.updated_at,
              r.name as role_name,
              c.name as company_name
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  // Cập nhật thông tin HR
  updateHRProfile: async (userId, data) => {
    const fields = []
    const params = []
    let paramIndex = 1

    const fieldMap = {
      fullname: 'fullname',
      phone: 'phone',
      address: 'address'
    }

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        fields.push(`${dbField} = $${paramIndex}`)
        params.push(data[key])
        paramIndex++
      }
    }

    if (fields.length === 0) {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      )
      return result.rows[0]
    }

    params.push(userId)
    const query = `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, fullname, phone, address, avatar,
                role_id, company_id, is_active, created_at, updated_at
    `

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  // Cập nhật avatar
  updateAvatar: async (userId, avatarData) => {
    const result = await pool.query(
      `UPDATE users
       SET avatar = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, fullname, phone, address, avatar,
                 role_id, company_id, is_active, created_at, updated_at`,
      [avatarData, userId]
    )
    return result.rows[0]
  },

  // Đổi mật khẩu
  changePassword: async (userId, hashedPassword) => {
    const result = await pool.query(
      `UPDATE users
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email`,
      [hashedPassword, userId]
    )
    return result.rows[0]
  },

  // Lấy password hash hiện tại
  getPasswordHash: async (userId) => {
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    )
    return result.rows[0]?.password_hash
  }
}

export default profileModel