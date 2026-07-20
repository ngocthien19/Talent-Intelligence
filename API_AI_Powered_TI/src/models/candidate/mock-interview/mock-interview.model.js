import pool from '~/config/db'

const mockInterviewModel = {
  getCandidateByUserId: async (userId) => {
    const result = await pool.query(
      `SELECT cp.*, u.fullname, u.email, u.phone
       FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.user_id = $1`,
      [userId]
    )
    return result.rows[0]
  },

  getCandidateById: async (candidateId) => {
    const result = await pool.query(
      `SELECT cp.*, u.fullname, u.email, u.phone
       FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.id
       WHERE cp.id = $1`,
      [candidateId]
    )
    return result.rows[0]
  },

  createChatSession: async (data) => {
    const { candidateId, sessionToken } = data

    const query = `
      INSERT INTO mock_interview_sessions (
        candidate_id, session_token, status
      ) VALUES ($1, $2, 'in_progress')
      RETURNING *
    `

    const result = await pool.query(query, [candidateId, sessionToken])
    return result.rows[0]
  },

  getChatSession: async (sessionId) => {
    const result = await pool.query(
      `SELECT s.*, cp.name as candidate_name, cp.email as candidate_email, cp.user_id
       FROM mock_interview_sessions s
       LEFT JOIN candidate_profiles cp ON s.candidate_id = cp.id
       WHERE s.id = $1`,
      [sessionId]
    )
    return result.rows[0]
  },

  updateChatSession: async (sessionId, data) => {
    const { messageCount, status } = data
    const updates = []
    const params = []
    let idx = 1

    if (messageCount !== undefined) {
      updates.push(`message_count = $${idx}`)
      params.push(messageCount)
      idx++
    }
    if (status) {
      updates.push(`status = $${idx}`)
      params.push(status)
      idx++
    }
    updates.push('updated_at = CURRENT_TIMESTAMP')

    const query = `
      UPDATE mock_interview_sessions
      SET ${updates.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `
    params.push(sessionId)

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  getChatSessionsByUserId: async (userId) => {
    const result = await pool.query(
      `SELECT s.*, 
              COUNT(m.id) as message_count
       FROM mock_interview_sessions s
       JOIN candidate_profiles cp ON s.candidate_id = cp.id
       LEFT JOIN mock_interview_messages m ON s.id = m.session_id
       WHERE cp.user_id = $1 
         AND (s.total_questions IS NULL OR s.total_questions = 0)
       GROUP BY s.id
       ORDER BY s.updated_at DESC`,
      [userId]
    )
    return result.rows
  },

  deleteChatSession: async (sessionId) => {
    const result = await pool.query(
      `DELETE FROM mock_interview_sessions 
       WHERE id = $1 AND (total_questions IS NULL OR total_questions = 0)
       RETURNING *`,
      [sessionId]
    )
    return result.rows[0]
  },

  isSessionOwner: async (sessionId, userId) => {
    const result = await pool.query(
      `SELECT s.id
       FROM mock_interview_sessions s
       JOIN candidate_profiles cp ON s.candidate_id = cp.id
       WHERE s.id = $1 AND cp.user_id = $2`,
      [sessionId, userId]
    )
    return result.rows.length > 0
  },

  saveChatMessage: async (data) => {
    const { sessionId, sender, message, metadata } = data

    const query = `
      INSERT INTO mock_interview_messages (
        session_id, sender, message, metadata
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `

    const result = await pool.query(query, [
      sessionId, sender, message, metadata || null
    ])
    return result.rows[0]
  },

  getChatHistory: async (sessionId) => {
    const result = await pool.query(
      `SELECT * FROM mock_interview_messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [sessionId]
    )
    return result.rows
  }
}

export default mockInterviewModel