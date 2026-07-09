import pool from '~/config/db.js'

const comparisonModel = {
  // Lấy thông tin nhiều ứng viên để so sánh
  getCandidatesForComparison: async (candidateIds, companyId) => {
    const placeholders = candidateIds.map((_, i) => `$${i + 1}`).join(', ')
    const params = [...candidateIds, companyId]

    const query = `
      SELECT c.id, c.name, c.email, c.phone, c.address,
             c.position_applied, c.cover_letter,
             c.overall_score, c.skills_match_score, c.culture_fit_score, c.retention_score,
             c.status, c.created_at,
             c.parsed_data, c.cv_url,
             jd.title as job_title, jd.description as job_description,
             jd.required_skills, jd.nice_to_have_skills,
             comp.name as company_name,
             a.result as analysis_result,
             a.strengths, a.weaknesses, a.suggestions,
             a.explanation as analysis_explanation
      FROM candidates c
      LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
      LEFT JOIN companies comp ON c.company_id = comp.id
      LEFT JOIN analyses a ON c.id = a.candidate_id AND a.analysis_type = 'full_analysis'
      WHERE c.id IN (${placeholders}) AND c.company_id = $${candidateIds.length + 1}
      ORDER BY c.overall_score DESC
    `

    const result = await pool.query(query, params)
    return result.rows
  },

  // Lấy thống kê kỹ năng của ứng viên
  getCandidateSkills: async (candidateId) => {
    const result = await pool.query(
      `SELECT parsed_data->'skills' as skills
       FROM candidates
       WHERE id = $1`,
      [candidateId]
    )
    return result.rows[0]?.skills || []
  },

  // Lấy lịch sử kinh nghiệm (nếu có)
  getCandidateExperience: async (candidateId) => {
    const result = await pool.query(
      `SELECT parsed_data->'experience' as experience
       FROM candidates
       WHERE id = $1`,
      [candidateId]
    )
    return result.rows[0]?.experience || null
  }
}

export default comparisonModel