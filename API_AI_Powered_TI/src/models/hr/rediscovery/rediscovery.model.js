import pool from '~/config/db.js'

const rediscoveryModel = {
  // Lấy danh sách ứng viên cũ (đã apply trước đó)
  getOldCandidates: async (companyId, limit = 100) => {
    const result = await pool.query(
      `SELECT c.id, c.name, c.email, c.phone, c.position_applied,
              c.overall_score, c.skills_match_score, c.culture_fit_score,
              c.retention_score, c.status, c.created_at,
              c.parsed_data, c.cv_text, c.cv_url,
              jd.title as job_title, jd.required_skills as jd_skills
       FROM candidates c
       LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
       WHERE c.company_id = $1
       AND c.status IN ('analyzed', 'shortlisted', 'rejected', 'pending')
       AND c.created_at < NOW() - INTERVAL '30 days'
       ORDER BY c.overall_score DESC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  // Lấy JD mới
  getJDById: async (jdId) => {
    const result = await pool.query(
      `SELECT id, title, description, requirements, required_skills,
              nice_to_have_skills, experience_level, employment_type,
              location, salary_range
       FROM job_descriptions
       WHERE id = $1 AND is_active = true`,
      [jdId]
    )
    return result.rows[0]
  },

  // Lưu kết quả rediscovery
  saveRediscovery: async (data) => {
    const {
      jdId,
      candidateId,
      matchScore,
      matchedSkills,
      missingSkills,
      suggestions,
      analysisData
    } = data

    const query = `
      INSERT INTO rediscovery_results (
        jd_id, candidate_id, match_score,
        matched_skills, missing_skills, suggestions,
        analysis_data, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', CURRENT_TIMESTAMP)
      RETURNING *
    `

    const result = await pool.query(query, [
      jdId, candidateId, matchScore,
      JSON.stringify(matchedSkills || []),
      JSON.stringify(missingSkills || []),
      JSON.stringify(suggestions || []),
      JSON.stringify(analysisData || {})
    ])

    return result.rows[0]
  },

  // Lấy danh sách rediscovery theo JD
  getRediscoveryByJD: async (jdId, limit = 20) => {
    const result = await pool.query(
      `SELECT r.*, c.name as candidate_name, c.email as candidate_email,
              c.position_applied, c.cv_url, c.overall_score as candidate_score,
              c.status as candidate_status
       FROM rediscovery_results r
       LEFT JOIN candidates c ON r.candidate_id = c.id
       WHERE r.jd_id = $1
       ORDER BY r.match_score DESC
       LIMIT $2`,
      [jdId, limit]
    )
    return result.rows
  },

  // Cập nhật trạng thái rediscovery
  updateRediscoveryStatus: async (id, status) => {
    const result = await pool.query(
      `UPDATE rediscovery_results
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    )
    return result.rows[0]
  },

  // Kiểm tra đã rediscovery chưa
  hasRediscovered: async (jdId, candidateId) => {
    const result = await pool.query(
      `SELECT id FROM rediscovery_results
       WHERE jd_id = $1 AND candidate_id = $2`,
      [jdId, candidateId]
    )
    return result.rows.length > 0
  },

  // Lấy tổng số rediscovery
  getRediscoveryCount: async (jdId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM rediscovery_results WHERE jd_id = $1',
      [jdId]
    )
    return parseInt(result.rows[0]?.count || 0)
  }
}

export default rediscoveryModel