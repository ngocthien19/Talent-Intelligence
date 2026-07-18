import pool from '~/config/db'

const userModel = {
  // Lấy user theo id
  findById: async (userId) => {
    const result = await pool.query(
      `SELECT id, email, password_hash, fullname, phone, address, 
              avatar, role_id, is_active, refresh_token, google_id,
              otp_hash, otp_expiry, last_login_at, created_at, updated_at
       FROM users 
       WHERE id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  // Lấy user theo email
  findByEmail: async (email) => {
    const result = await pool.query(
      `SELECT id, email, password_hash, fullname, phone, address, 
              avatar, role_id, is_active, refresh_token, google_id,
              otp_hash, otp_expiry, last_login_at, created_at, updated_at
       FROM users 
       WHERE email = $1`,
      [email]
    )
    return result.rows[0]
  },

  // Tạo user mới
  create: async (data) => {
    const {
      email,
      password_hash,
      fullname,
      phone,
      address,
      avatar,
      role_id,
      google_id,
      otp_hash,
      otp_expiry
    } = data

    const query = `
      INSERT INTO users (
        email, password_hash, fullname, phone, address, avatar,
        role_id, google_id, otp_hash, otp_expiry
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, fullname, phone, address, avatar, role_id, google_id
    `

    const result = await pool.query(query, [
      email,
      password_hash,
      fullname,
      phone || '',
      address || '',
      avatar || null,
      role_id,
      google_id || null,
      otp_hash || null,
      otp_expiry || null
    ])

    return result.rows[0]
  },

  // Cập nhật refresh token
  updateRefreshToken: async (userId, refreshToken) => {
    const result = await pool.query(
      `UPDATE users 
       SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, fullname`,
      [refreshToken, userId]
    )
    return result.rows[0]
  },

  // Cập nhật mật khẩu
  updatePassword: async (userId, hashedPassword) => {
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, fullname`,
      [hashedPassword, userId]
    )
    return result.rows[0]
  },

  // Cập nhật google_id
  updateGoogleId: async (userId, googleId) => {
    const result = await pool.query(
      `UPDATE users 
       SET google_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, email, fullname, google_id`,
      [googleId, userId]
    )
    return result.rows[0]
  },

  // Cập nhật OTP
  updateOtp: async (userId, otpHash, otpExpiry) => {
    const result = await pool.query(
      `UPDATE users 
       SET otp_hash = $1, otp_expiry = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, email`,
      [otpHash, otpExpiry, userId]
    )
    return result.rows[0]
  },

  // Cập nhật last login
  updateLastLogin: async (userId) => {
    const result = await pool.query(
      `UPDATE users 
       SET last_login_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id`,
      [userId]
    )
    return result.rows[0]
  },

  // Cập nhật thông tin user
  update: async (userId, data) => {
    const { fullname, phone, address, avatar } = data
    const query = `
      UPDATE users 
      SET 
        fullname = COALESCE($1, fullname),
        phone = COALESCE($2, phone),
        address = COALESCE($3, address),
        avatar = COALESCE($4, avatar),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, email, fullname, phone, address, avatar
    `

    const result = await pool.query(query, [
      fullname,
      phone,
      address,
      avatar,
      userId
    ])

    return result.rows[0]
  },

  // Lấy role của user
  getRole: async (userId) => {
    const result = await pool.query(
      `SELECT r.name 
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    )
    return result.rows[0]?.name
  }
}

export default userModel