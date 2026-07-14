import pool from '~/config/db.js'

const analysisModel = {
  // Lấy thông tin candidate để phân tích
  getCandidateForAnalysis: async (candidateId) => {
    const result = await pool.query(
      `SELECT c.*, jd.title as job_title, jd.description as job_description,
              jd.required_skills, jd.nice_to_have_skills,
              comp.name as company_name, comp.culture_description
       FROM candidates c
       LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
       LEFT JOIN companies comp ON c.company_id = comp.id
       WHERE c.id = $1`,
      [candidateId]
    )
    return result.rows[0]
  },

  // Lưu kết quả phân tích
  saveAnalysis: async (data) => {
    const {
      candidate_id,
      analysis_type,
      result,
      score,
      explanation,
      strengths,
      weaknesses,
      suggestions,
      processing_time
    } = data

    const query = `
      INSERT INTO analyses (
        candidate_id, analysis_type, result, score,
        explanation, strengths, weaknesses, suggestions,
        processing_time, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'completed')
      RETURNING *
    `

    const resultQuery = await pool.query(query, [
      candidate_id, analysis_type, JSON.stringify(result), score,
      explanation, JSON.stringify(strengths), JSON.stringify(weaknesses),
      JSON.stringify(suggestions), processing_time
    ])

    return resultQuery.rows[0]
  },

  // Cập nhật candidate scores
  updateCandidateScores: async (candidateId, scores) => {
    const { overall_score, skills_match_score, culture_fit_score, retention_score } = scores

    const query = `
      UPDATE candidates
      SET overall_score = $1,
          skills_match_score = $2,
          culture_fit_score = $3,
          retention_score = $4,
          status = 'analyzed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `

    const result = await pool.query(query, [
      overall_score, skills_match_score, culture_fit_score, retention_score, candidateId
    ])

    return result.rows[0]
  },

  // Lấy kết quả phân tích
  getAnalysisResult: async (candidateId) => {
    const result = await pool.query(
      `SELECT * FROM analyses
       WHERE candidate_id = $1
       AND analysis_type = 'full_analysis'
       ORDER BY created_at DESC
       LIMIT 1`,
      [candidateId]
    )
    return result.rows[0]
  },

  // Kiểm tra đã phân tích chưa
  hasAnalyzed: async (candidateId) => {
    const result = await pool.query(
      `SELECT id FROM analyses
       WHERE candidate_id = $1
       AND analysis_type = 'full_analysis'
       AND status = 'completed'`,
      [candidateId]
    )
    return result.rows.length > 0
  }
}

export default analysisModel