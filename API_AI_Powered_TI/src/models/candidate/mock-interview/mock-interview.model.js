import pool from '~/config/db'

const mockInterviewModel = {
  // Lấy candidate theo user_id
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

  // Lấy thông tin candidate theo candidate_id
  getCandidateById: async (candidateId) => {
    const result = await pool.query(
      `SELECT c.*, u.fullname, u.email, u.phone
       FROM candidates c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [candidateId]
    )
    return result.rows[0]
  },

  // Lấy thông tin job (JD)
  getJob: async (jobId) => {
    const result = await pool.query(
      `SELECT j.*, comp.name as company_name
       FROM job_descriptions j
       LEFT JOIN companies comp ON j.company_id = comp.id
       WHERE j.id = $1`,
      [jobId]
    )
    return result.rows[0]
  },

  // Tạo session mới
  createSession: async (data) => {
    const {
      candidateId,
      sessionToken,
      totalQuestions
    } = data

    const query = `
      INSERT INTO mock_interview_sessions (
        candidate_id, session_token, total_questions, status
      ) VALUES ($1, $2, $3, 'in_progress')
      RETURNING *
    `

    const result = await pool.query(query, [
      candidateId, sessionToken, totalQuestions
    ])
    return result.rows[0]
  },

  // Lấy session
  getSession: async (sessionId) => {
    const result = await pool.query(
      `SELECT s.*, c.name as candidate_name, c.email as candidate_email,
              c.position_applied, c.user_id
       FROM mock_interview_sessions s
       LEFT JOIN candidates c ON s.candidate_id = c.id
       WHERE s.id = $1`,
      [sessionId]
    )
    return result.rows[0]
  },

  // Lấy session theo token
  getSessionByToken: async (token) => {
    const result = await pool.query(
      'SELECT * FROM mock_interview_sessions WHERE session_token = $1',
      [token]
    )
    return result.rows[0]
  },

  // Lưu câu hỏi
  saveQuestions: async (questions) => {
    const savedQuestions = []
    for (const q of questions) {
      const query = `
        INSERT INTO interview_questions (
          candidate_id, question, reason, trap, suggestion,
          category, difficulty, "order"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `
      const result = await pool.query(query, [
        q.candidateId,
        q.question,
        q.reason || null,
        q.trap || null,
        q.suggestion || null,
        q.category || 'general',
        q.difficulty || 'medium',
        q.order || 0
      ])
      savedQuestions.push(result.rows[0])
    }
    return savedQuestions
  },

  // Lấy câu hỏi theo session
  getQuestionsBySession: async (sessionId) => {
    const result = await pool.query(
      `SELECT q.*
       FROM interview_questions q
       JOIN mock_interview_sessions s ON q.candidate_id = s.candidate_id
       WHERE s.id = $1
       ORDER BY q.order ASC`,
      [sessionId]
    )
    return result.rows
  },

  // Lấy câu hỏi theo ID
  getQuestionById: async (questionId) => {
    const result = await pool.query(
      'SELECT * FROM interview_questions WHERE id = $1',
      [questionId]
    )
    return result.rows[0]
  },

  // Lưu câu trả lời
  saveAnswer: async (data) => {
    const {
      sessionId,
      questionId,
      answerText,
      feedback,
      score,
      strengths,
      weaknesses,
      suggestion,
      responseTime
    } = data

    const query = `
      INSERT INTO interview_answers (
        session_id, question_id, answer_text, feedback, score,
        strengths, weaknesses, suggestion, response_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const result = await pool.query(query, [
      sessionId, questionId, answerText, feedback, score,
      strengths ? JSON.stringify(strengths) : null,
      weaknesses ? JSON.stringify(weaknesses) : null,
      suggestion || null,
      responseTime || null
    ])
    return result.rows[0]
  },

  // Cập nhật session
  updateSession: async (sessionId, data) => {
    const fields = []
    const params = []
    let paramIndex = 1

    const fieldMap = {
      answeredQuestions: 'answered_questions',
      currentQuestionIndex: 'current_question_index',
      status: 'status',
      endedAt: 'ended_at',
      overallFeedback: 'overall_feedback',
      strengths: 'strengths',
      weaknesses: 'weaknesses',
      suggestions: 'suggestions'
    }

    for (const [key, dbField] of Object.entries(fieldMap)) {
      if (data[key] !== undefined) {
        let value = data[key]
        if (key === 'strengths' || key === 'weaknesses' || key === 'suggestions') {
          value = JSON.stringify(value)
        }
        fields.push(`${dbField} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    }

    if (fields.length === 0) {
      const result = await pool.query(
        'SELECT * FROM mock_interview_sessions WHERE id = $1',
        [sessionId]
      )
      return result.rows[0]
    }

    params.push(sessionId)
    const query = `
      UPDATE mock_interview_sessions
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  // Lấy lịch sử session của candidate
  getSessionsByUserId: async (userId, limit = 10) => {
    const result = await pool.query(
      `SELECT s.*, 
              COUNT(a.id) as answered_count
       FROM mock_interview_sessions s
       LEFT JOIN interview_answers a ON s.id = a.session_id
       JOIN candidates c ON s.candidate_id = c.id
       WHERE c.user_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT $2`,
      [userId, limit]
    )
    return result.rows
  },

  // Lấy chi tiết session
  getSessionDetail: async (sessionId) => {
    const result = await pool.query(
      `SELECT 
        s.*,
        c.name as candidate_name,
        c.email as candidate_email,
        c.position_applied,
        c.user_id,
        json_agg(
          json_build_object(
            'id', q.id,
            'question', q.question,
            'category', q.category,
            'difficulty', q.difficulty,
            'answer', a.answer_text,
            'feedback', a.feedback,
            'score', a.score,
            'suggestion', a.suggestion
          ) ORDER BY q.order ASC
        ) as questions
       FROM mock_interview_sessions s
       LEFT JOIN candidates c ON s.candidate_id = c.id
       LEFT JOIN interview_questions q ON q.candidate_id = c.id
       LEFT JOIN interview_answers a ON a.question_id = q.id AND a.session_id = s.id
       WHERE s.id = $1
       GROUP BY s.id, c.id`,
      [sessionId]
    )
    return result.rows[0]
  },

  // Kiểm tra session có thuộc về user không
  isSessionOwner: async (sessionId, userId) => {
    const result = await pool.query(
      `SELECT s.id
       FROM mock_interview_sessions s
       JOIN candidates c ON s.candidate_id = c.id
       WHERE s.id = $1 AND c.user_id = $2`,
      [sessionId, userId]
    )
    return result.rows.length > 0
  },

  // Lấy câu trả lời theo question_id và session_id
  getAnswerByQuestionAndSession: async (questionId, sessionId) => {
    const result = await pool.query(
      `SELECT score, strengths, weaknesses, suggestion 
       FROM interview_answers 
       WHERE question_id = $1 AND session_id = $2`,
      [questionId, sessionId]
    )
    return result.rows[0]
  },

  // Lấy tất cả câu trả lời của session (có cả điểm)
  getAnswersBySession: async (sessionId) => {
    const result = await pool.query(
      `SELECT a.*, q.question, q.category, q.difficulty
       FROM interview_answers a
       JOIN interview_questions q ON a.question_id = q.id
       WHERE a.session_id = $1
       ORDER BY q.order ASC`,
      [sessionId]
    )
    return result.rows
  },

  // Lấy tổng điểm của session
  getSessionScoreSummary: async (sessionId) => {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_answers,
        AVG(score) as avg_score,
        SUM(score) as total_score
       FROM interview_answers
       WHERE session_id = $1
       AND score IS NOT NULL`,
      [sessionId]
    )
    return result.rows[0]
  }
}

export default mockInterviewModel