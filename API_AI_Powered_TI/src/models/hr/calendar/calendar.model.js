import pool from '~/config/db'

const calendarModel = {
  // Tạo lịch phỏng vấn
  createSchedule: async (data) => {
    const {
      candidateId,
      interviewDate,
      duration,
      location,
      meetingLink,
      googleEventId,
      notes
    } = data

    const query = `
      INSERT INTO interview_schedules (
        candidate_id,
        interview_date,
        duration,
        location,
        meeting_link,
        google_event_id,
        notes,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled')
      RETURNING *
    `

    const result = await pool.query(query, [
      candidateId, // applicationId
      interviewDate,
      duration || 60,
      location || null,
      meetingLink || null,
      googleEventId || null,
      notes || null
    ])

    return result.rows[0]
  },

  // Lấy danh sách lịch phỏng vấn theo candidate (application)
  getSchedulesByCandidate: async (candidateId) => {
    const result = await pool.query(
      `SELECT s.*, 
              a.position as position_applied,
              cp.name as candidate_name, 
              cp.email as candidate_email,
              cp.phone as candidate_phone
       FROM interview_schedules s
       LEFT JOIN applications a ON s.candidate_id = a.id
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE s.candidate_id = $1
       ORDER BY s.interview_date ASC`,
      [candidateId]
    )
    return result.rows
  },

  // Lấy danh sách lịch phỏng vấn theo công ty
  getSchedulesByCompany: async (companyId, limit = 20, offset = 0) => {
    const result = await pool.query(
      `SELECT s.*, 
              a.position as position_applied,
              cp.name as candidate_name, 
              cp.email as candidate_email,
              cp.phone as candidate_phone
       FROM interview_schedules s
       LEFT JOIN applications a ON s.candidate_id = a.id
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.company_id = $1
       ORDER BY s.interview_date ASC
       LIMIT $2 OFFSET $3`,
      [companyId, limit, offset]
    )
    return result.rows
  },

  // Lấy chi tiết lịch phỏng vấn
  getScheduleById: async (id) => {
    const result = await pool.query(
      `SELECT s.*, 
              a.position as position_applied,
              a.company_id,
              cp.name as candidate_name, 
              cp.email as candidate_email,
              cp.phone as candidate_phone,
              comp.name as company_name
       FROM interview_schedules s
       LEFT JOIN applications a ON s.candidate_id = a.id
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       LEFT JOIN companies comp ON a.company_id = comp.id
       WHERE s.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  // Cập nhật trạng thái lịch
  updateScheduleStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE interview_schedules 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )
    return result.rows[0]
  },

  // Cập nhật google_event_id
  updateGoogleEventId: async (id, googleEventId) => {
    const result = await pool.query(
      `UPDATE interview_schedules 
       SET google_event_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [googleEventId, id]
    )
    return result.rows[0]
  },

  // Cập nhật meeting link
  updateMeetingLink: async (id, meetingLink) => {
    const result = await pool.query(
      `UPDATE interview_schedules 
       SET meeting_link = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [meetingLink, id]
    )
    return result.rows[0]
  },

  // Xác nhận lịch (candidate confirm)
  confirmSchedule: async (id) => {
    const result = await pool.query(
      `UPDATE interview_schedules 
       SET confirmed_by_candidate = true, 
           confirmed_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    )
    return result.rows[0]
  },

  // Xóa lịch
  deleteSchedule: async (id) => {
    const result = await pool.query(
      'DELETE FROM interview_schedules WHERE id = $1 RETURNING *',
      [id]
    )
    return result.rows[0]
  },

  // Lấy số lượng lịch
  getScheduleCount: async (candidateId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM interview_schedules WHERE candidate_id = $1',
      [candidateId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Lấy lịch sắp tới
  getUpcomingSchedules: async (companyId, limit = 5) => {
    const result = await pool.query(
      `SELECT s.*, 
              a.position as position_applied,
              cp.name as candidate_name, 
              cp.email as candidate_email
       FROM interview_schedules s
       LEFT JOIN applications a ON s.candidate_id = a.id
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.company_id = $1
       AND s.interview_date > NOW()
       AND s.status = 'scheduled'
       ORDER BY s.interview_date ASC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  // Lấy lịch hôm nay
  getTodaySchedules: async (companyId) => {
    const result = await pool.query(
      `SELECT s.*, 
              a.position as position_applied,
              cp.name as candidate_name, 
              cp.email as candidate_email
       FROM interview_schedules s
       LEFT JOIN applications a ON s.candidate_id = a.id
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.company_id = $1
       AND s.interview_date::date = CURRENT_DATE
       ORDER BY s.interview_date ASC`,
      [companyId]
    )
    return result.rows
  }
}

export default calendarModel