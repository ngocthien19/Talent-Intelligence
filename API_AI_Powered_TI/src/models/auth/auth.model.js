import pool from '~/config/db'

const authModel = {
  // Tìm user theo email
  findByEmail: async (email) => {
    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    )
    return result.rows[0]
  },

  // Tạo user pending (chưa active)
  createPendingUser: async (data) => {
    const { fullname, email, password, phone, address, otpCode, otpExpiry, roleId } = data

    const query = `
      INSERT INTO users (fullname, email, password_hash, phone, address, otp_hash, otp_expiry, role_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)
      ON CONFLICT (email) DO UPDATE SET
        fullname = $1,
        password_hash = $3,
        phone = $4,
        address = $5,
        otp_hash = $6,
        otp_expiry = $7,
        role_id = $8,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    const result = await pool.query(query, [
      fullname, email, password, phone, address, otpCode, otpExpiry, roleId
    ])
    return result.rows[0]
  },

  // Lấy thông tin OTP
  getOtpInfo: async (email) => {
    const result = await pool.query(
      'SELECT otp_hash, otp_expiry, is_active FROM users WHERE email = $1',
      [email]
    )
    return result.rows[0]
  },

  // Kích hoạt tài khoản
  activateUser: async (email) => {
    const result = await pool.query(
      `UPDATE users 
       SET is_active = true, otp_hash = NULL, otp_expiry = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE email = $1
       RETURNING *`,
      [email]
    )
    return result.rows[0]
  },

  // Lấy thông tin user để login
  getLoginUser: async (email) => {
    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [email]
    )
    return result.rows[0]
  },

  findByGoogleId: async (googleId) => {
    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.google_id = $1`,
      [googleId]
    )
    return result.rows[0]
  },

  // Tạo user từ Google
  createGoogleUser: async (data) => {
    const { email, fullname, googleId, avatar, roleId, isActive } = data

    const query = `
      INSERT INTO users (email, fullname, google_id, avatar, role_id, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `

    const result = await pool.query(query, [
      email, fullname, googleId, avatar || null, roleId, isActive !== undefined ? isActive : true
    ])
    return result.rows[0]
  },

  // Cập nhật google_id cho user đã tồn tại
  updateGoogleId: async (userId, googleId) => {
    const result = await pool.query(
      `UPDATE users 
       SET google_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [googleId, userId]
    )
    return result.rows[0]
  },

  // Cập nhật last login
  updateLastLogin: async (userId) => {
    await pool.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    )
  },

  // Lấy user theo ID
  getLoginUserById: async (userId) => {
    const result = await pool.query(
      `SELECT u.*, r.name as role_name 
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  // Cập nhật refresh token
  updateRefreshToken: async (userId, refreshToken) => {
    await pool.query(
      'UPDATE users SET refresh_token = $1 WHERE id = $2',
      [refreshToken, userId]
    )
  },

  // Xóa refresh token
  removeRefreshToken: async (refreshToken) => {
    await pool.query(
      'UPDATE users SET refresh_token = NULL WHERE refresh_token = $1',
      [refreshToken]
    )
  },

  // Cập nhật OTP quên mật khẩu
  updateForgotPasswordOtp: async (email, otpCode, otpExpiry) => {
    const result = await pool.query(
      `UPDATE users 
       SET otp_hash = $1, otp_expiry = $2, updated_at = CURRENT_TIMESTAMP
       WHERE email = $3
       RETURNING *`,
      [otpCode, otpExpiry, email]
    )
    return result.rows[0]
  },

  // Cập nhật mật khẩu mới
  updateNewPassword: async (email, hashedPassword) => {
    const result = await pool.query(
      `UPDATE users 
       SET password_hash = $1, otp_hash = NULL, otp_expiry = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE email = $2
       RETURNING *`,
      [hashedPassword, email]
    )
    return result.rows[0]
  },

  // Xác thực refresh token
  verifyRefreshToken: async (userId, refreshToken) => {
    const result = await pool.query(
      'SELECT refresh_token FROM users WHERE id = $1',
      [userId]
    )
    if (result.rows.length === 0) return false
    return result.rows[0].refresh_token === refreshToken
  },

  // Lấy role ID theo tên
  getRoleIdByName: async (roleName) => {
    const result = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [roleName]
    )
    return result.rows[0]?.id || null
  }
}

export default authModel