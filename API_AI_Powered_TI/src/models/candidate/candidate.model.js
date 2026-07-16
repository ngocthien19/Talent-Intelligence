import pool from '~/config/db'

const candidateModel = {
  // Tạo ứng viên mới
  create: async (data) => {
    const {
      user_id,
      company_id,
      jd_id,
      name,
      email,
      phone,
      address,
      position_applied,
      cover_letter,
      source,
      cv_text,
      cv_url,
      cv_original_name,
      cv_file_size,
      cv_mime_type,
      parsed_data,
      jd_text
    } = data

    const query = `
      INSERT INTO candidates (
        user_id, company_id, jd_id, name, email, phone, address,
        position_applied, cover_letter, source, cv_text, cv_url,
        cv_original_name, cv_file_size, cv_mime_type, parsed_data, jd_text
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `

    const result = await pool.query(query, [
      user_id, company_id, jd_id, name, email, phone, address,
      position_applied, cover_letter, source, cv_text, cv_url,
      cv_original_name, cv_file_size, cv_mime_type, parsed_data, jd_text
    ])
    return result.rows[0]
  },

  // Lấy danh sách ứng tuyển của candidate
  findByUserId: async (userId) => {
    const result = await pool.query(
      `SELECT c.*, jd.title as job_title, jd.location as job_location,
              comp.name as company_name
       FROM candidates c
       LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
       LEFT JOIN companies comp ON c.company_id = comp.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    )
    return result.rows
  },

  getCandidateByUserId: async (userId) => {
    const result = await pool.query(
      `SELECT c.*, u.fullname, u.email, u.phone
       FROM candidates c
       JOIN users u ON c.user_id = u.id
       WHERE c.user_id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  // Lấy chi tiết ứng tuyển
  findById: async (id, userId) => {
    const result = await pool.query(
      `SELECT c.*, jd.title as job_title, jd.description as job_description,
              jd.location as job_location, jd.required_skills,
              comp.name as company_name, comp.logo as company_logo,
              comp.culture_description as company_culture
       FROM candidates c
       LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
       LEFT JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1 AND c.user_id = $2`,
      [id, userId]
    )
    return result.rows[0]
  },

  // Lấy chi tiết ứng tuyển theo ID (không cần userId - cho HR)
  findByIdAdmin: async (id) => {
    const result = await pool.query(
      `SELECT c.*, jd.title as job_title, jd.description as job_description,
              jd.location as job_location, jd.required_skills,
              comp.name as company_name, comp.logo as company_logo,
              comp.culture_description as company_culture
       FROM candidates c
       LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
       LEFT JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  // Kiểm tra đã ứng tuyển chưa
  hasApplied: async (userId, jdId) => {
    const result = await pool.query(
      'SELECT id FROM candidates WHERE user_id = $1 AND jd_id = $2',
      [userId, jdId]
    )
    return result.rows.length > 0
  },

  // Cập nhật trạng thái
  updateStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE candidates 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )
    return result.rows[0]
  },

  // Cập nhật điểm số
  updateScores: async (id, scores) => {
    const { overall_score, skills_match_score, culture_fit_score, retention_score } = scores
    const result = await pool.query(
      `UPDATE candidates 
       SET overall_score = $1, skills_match_score = $2,
           culture_fit_score = $3, retention_score = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [overall_score, skills_match_score, culture_fit_score, retention_score, id]
    )
    return result.rows[0]
  },

  // Cập nhật phân tích
  updateAnalysisResult: async (id, analysisResult) => {
    const result = await pool.query(
      `UPDATE candidates 
       SET analysis_result = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [analysisResult, id]
    )
    return result.rows[0]
  },

  // Lấy thông tin hồ sơ user
  getProfile: async (userId) => {
    const result = await pool.query(
      `SELECT id, email, fullname, phone, address, avatar, role_id, is_active, created_at
       FROM users 
       WHERE id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  // Cập nhật hồ sơ user
  updateProfile: async (userId, data) => {
    const { fullname, phone, address, avatar } = data
    const params = []
    let paramIndex = 1
    let query = 'UPDATE users SET '

    if (fullname !== undefined) {
      query += `fullname = $${paramIndex}, `
      params.push(fullname)
      paramIndex++
    }

    if (phone !== undefined) {
      query += `phone = $${paramIndex}, `
      params.push(phone)
      paramIndex++
    }

    if (address !== undefined) {
      query += `address = $${paramIndex}, `
      params.push(address)
      paramIndex++
    }

    if (avatar !== undefined) {
      query += `avatar = $${paramIndex}, `
      params.push(avatar)
      paramIndex++
    }

    // Nếu không có field nào được cập nhật
    if (params.length === 0) {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
      return result.rows[0]
    }

    query += `updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`
    params.push(userId)

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  // Cập nhật avatar
  updateAvatar: async (userId, avatarData) => {
    const result = await pool.query(
      `UPDATE users 
       SET avatar = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [avatarData, userId]
    )
    return result.rows[0]
  },

  // Cập nhật trạng thái đã gửi báo cáo
  updateNotified: async (candidateId) => {
    const result = await pool.query(
      `UPDATE candidates 
       SET is_notified = true, 
           report_sent_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [candidateId]
    )
    return result.rows[0]
  },

  // Kiểm tra đã gửi báo cáo chưa
  checkNotified: async (candidateId) => {
    const result = await pool.query(
      `SELECT is_notified, report_sent_at 
       FROM candidates 
       WHERE id = $1`,
      [candidateId]
    )
    return result.rows[0]
  }
}

export default candidateModel