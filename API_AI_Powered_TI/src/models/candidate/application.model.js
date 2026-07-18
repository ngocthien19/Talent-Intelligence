import pool from '~/config/db'

const applicationModel = {
  // Tạo application mới
  create: async (data) => {
    const {
      candidate_profile_id,
      company_id,
      job_description_id,
      position,
      cover_letter_text,
      source,
      jd_text,
      status = 'pending'
    } = data

    const query = `
      INSERT INTO applications (
        candidate_profile_id, company_id, job_description_id,
        position, cover_letter_text, source, jd_text, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const result = await pool.query(query, [
      candidate_profile_id,
      company_id,
      job_description_id,
      position,
      cover_letter_text || '',
      source || 'website',
      jd_text || '',
      status
    ])

    return result.rows[0]
  },

  // Kiểm tra đã ứng tuyển chưa
  hasApplied: async (candidateProfileId, jobDescriptionId) => {
    const result = await pool.query(
      `SELECT id FROM applications 
       WHERE candidate_profile_id = $1 AND job_description_id = $2`,
      [candidateProfileId, jobDescriptionId]
    )
    return result.rows.length > 0
  },

  // Lấy danh sách applications của candidate
  findByCandidateProfileId: async (candidateProfileId, params = {}) => {
    const { limit = 20, page = 1, status } = params
    const offset = (page - 1) * limit

    let query = `
      SELECT a.*, 
             jd.title as job_title, 
             jd.location as job_location,
             comp.name as company_name,
             comp.logo as company_logo,
             cp.cv_url,              
             cp.cv_original_name,    
             cp.cv_mime_type,       
             cp.cv_file_size         
      FROM applications a
      LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
      LEFT JOIN companies comp ON a.company_id = comp.id
      LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
      WHERE a.candidate_profile_id = $1
    `

    const values = [candidateProfileId]
    let paramIndex = 2

    if (status) {
      query += ` AND a.status = $${paramIndex}`
      values.push(status)
      paramIndex++
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    values.push(limit, offset)

    const result = await pool.query(query, values)
    return result.rows
  },

  // Lấy chi tiết application
  findById: async (id, candidateProfileId) => {
    const result = await pool.query(
      `SELECT a.*, 
              jd.title as job_title, 
              jd.description as job_description,
              jd.location as job_location, 
              jd.required_skills,
              comp.name as company_name, 
              comp.logo as company_logo,
              comp.culture_description as company_culture,
              cp.name as candidate_name,
              cp.email as candidate_email,
              cp.phone as candidate_phone,
              cp.avatar as candidate_avatar,
              cp.cv_url,              
              cp.cv_original_name,    
              cp.cv_mime_type,        
              cp.cv_file_size,        
              cp.cv_text,             
              cp.parsed_data          
       FROM applications a
       LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
       LEFT JOIN companies comp ON a.company_id = comp.id
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.id = $1 AND a.candidate_profile_id = $2`,
      [id, candidateProfileId]
    )
    return result.rows[0]
  },

  // Cập nhật trạng thái
  updateStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE applications 
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
      `UPDATE applications 
       SET 
         overall_score = $1, 
         skills_match_score = $2,
         culture_fit_score = $3, 
         retention_score = $4,
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
      `UPDATE applications 
       SET analysis_result = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [analysisResult, id]
    )
    return result.rows[0]
  },

  // Lấy số lượng ứng tuyển của candidate
  countByCandidateProfileId: async (candidateProfileId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM applications WHERE candidate_profile_id = $1',
      [candidateProfileId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Lấy chi tiết application cho HR
  findByIdAdmin: async (id) => {
    const result = await pool.query(
      `SELECT a.*, 
              jd.title as job_title, 
              jd.description as job_description,
              jd.location as job_location, 
              jd.required_skills,
              comp.name as company_name, 
              comp.logo as company_logo,
              comp.culture_description as company_culture,
              cp.name as candidate_name,
              cp.email as candidate_email,
              cp.phone as candidate_phone,
              cp.avatar as candidate_avatar,
              cp.cv_url,              
              cp.cv_original_name,    
              cp.cv_mime_type,        
              cp.cv_file_size,        
              cp.cv_text,             
              cp.parsed_data          
       FROM applications a
       LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
       LEFT JOIN companies comp ON a.company_id = comp.id
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.id = $1`,
      [id]
    )
    return result.rows[0]
  },

  // Cập nhật trạng thái đã gửi báo cáo
  updateNotified: async (applicationId) => {
    const result = await pool.query(
      `UPDATE applications 
       SET is_notified = true, 
           report_sent_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [applicationId]
    )
    return result.rows[0]
  },

  // Kiểm tra đã gửi báo cáo chưa
  checkNotified: async (applicationId) => {
    const result = await pool.query(
      `SELECT is_notified, report_sent_at 
       FROM applications 
       WHERE id = $1`,
      [applicationId]
    )
    return result.rows[0]
  }
}

export default applicationModel