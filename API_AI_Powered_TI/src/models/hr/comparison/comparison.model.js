// src/models/hr/comparison/comparison.model.js
import pool from '~/config/db.js'

const comparisonModel = {
  // Lấy thông tin nhiều ứng viên để so sánh
  getCandidatesForComparison: async (candidateIds, companyId) => {
    const placeholders = candidateIds.map((_, i) => `$${i + 1}`).join(', ')
    const params = [...candidateIds, companyId]

    const query = `
      SELECT 
        a.id,
        a.id as candidate_id,
        cp.name,
        cp.email,
        cp.phone,
        cp.address,
        cp.avatar,
        a.position as position_applied,
        a.cover_letter_text as cover_letter,
        a.overall_score,
        a.skills_match_score,
        a.culture_fit_score,
        a.retention_score,
        a.status,
        a.created_at,
        cp.parsed_data,
        cp.cv_url,
        jd.title as job_title,
        jd.description as job_description,
        jd.required_skills,
        jd.nice_to_have_skills,
        comp.name as company_name,
        an.result as analysis_result,
        an.strengths,
        an.weaknesses,
        an.suggestions,
        an.explanation as analysis_explanation
      FROM applications a
      LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
      LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
      LEFT JOIN companies comp ON a.company_id = comp.id
      LEFT JOIN analyses an ON a.id = an.candidate_id AND an.analysis_type = 'full_analysis'
      WHERE a.id IN (${placeholders}) AND a.company_id = $${candidateIds.length + 1}
      ORDER BY a.overall_score DESC
    `

    const result = await pool.query(query, params)
    return result.rows
  },

  // Lấy thống kê kỹ năng của ứng viên
  getCandidateSkills: async (candidateId) => {
    const result = await pool.query(
      `SELECT cp.parsed_data->'skills' as skills
       FROM applications a
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.id = $1`,
      [candidateId]
    )
    return result.rows[0]?.skills || []
  },

  // Lấy lịch sử kinh nghiệm
  getCandidateExperience: async (candidateId) => {
    const result = await pool.query(
      `SELECT cp.parsed_data->'experience' as experience
       FROM applications a
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       WHERE a.id = $1`,
      [candidateId]
    )
    return result.rows[0]?.experience || null
  }
}

export default comparisonModel