import pool from '~/config/db'

const notificationModel = {
  // Tạo thông báo mới
  create: async (data) => {
    const {
      candidateId,
      companyId,
      userId,
      type,
      title,
      content,
      extraData,
      isSent = true
    } = data

    const query = `
      INSERT INTO notifications (
        candidate_id, company_id, user_id,
        type, title, content, data, is_sent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const result = await pool.query(query, [
      candidateId || null,
      companyId || null,
      userId || null,
      type || 'system',
      title,
      content,
      extraData ? JSON.stringify(extraData) : null,
      isSent
    ])

    return result.rows[0]
  },

  // Lấy thông báo của candidate
  getByCandidate: async (candidateId, limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE candidate_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [candidateId, limit, offset]
    )
    return result.rows
  },

  // Lấy thông báo của user (HR)
  getByUser: async (userId, limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    )
    return result.rows
  },

  // Lấy thông báo của company (tất cả HR trong công ty)
  getByCompany: async (companyId, limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE company_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset]
    )
    return result.rows
  },

  // Lấy thông báo chưa đọc của candidate
  getUnreadByCandidate: async (candidateId) => {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE candidate_id = $1 AND is_read = false
       ORDER BY created_at DESC`,
      [candidateId]
    )
    return result.rows
  },

  // Lấy thông báo chưa đọc của user (HR)
  getUnreadByUser: async (userId) => {
    const result = await pool.query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND is_read = false
       ORDER BY created_at DESC`,
      [userId]
    )
    return result.rows
  },

  // Đếm chưa đọc của candidate
  countUnreadByCandidate: async (candidateId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE candidate_id = $1 AND is_read = false`,
      [candidateId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Đếm chưa đọc của user (HR)
  countUnreadByUser: async (userId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Đánh dấu đã đọc
  markAsRead: async (id) => {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  // Đánh dấu tất cả đã đọc (candidate)
  markAllAsReadByCandidate: async (candidateId) => {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE candidate_id = $1 AND is_read = false
       RETURNING *`,
      [candidateId]
    )
    return result.rows
  },

  // Đánh dấu tất cả đã đọc (user)
  markAllAsReadByUser: async (userId) => {
    const result = await pool.query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false
       RETURNING *`,
      [userId]
    )
    return result.rows
  },

  // Xóa thông báo
  delete: async (id) => {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  },

  // Xóa tất cả thông báo của candidate
  deleteAllByCandidate: async (candidateId) => {
    await pool.query(
      'DELETE FROM notifications WHERE candidate_id = $1',
      [candidateId]
    )
    return true
  },

  // Xóa tất cả thông báo của user
  deleteAllByUser: async (userId) => {
    await pool.query(
      'DELETE FROM notifications WHERE user_id = $1',
      [userId]
    )
    return true
  }
}

export default notificationModel