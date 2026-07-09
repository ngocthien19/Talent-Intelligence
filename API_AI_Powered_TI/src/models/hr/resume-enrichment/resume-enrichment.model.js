import pool from '~/config/db.js'

const resumeEnrichmentModel = {
  // Lưu kết quả phân tích nâng cao
  saveEnrichment: async (data) => {
    const {
      candidateId,
      promotionSpeed,
      promotionHistory,
      employmentGaps,
      gapMonths,
      achievementDetailScore,
      skillDiversityScore,
      skillDiversityDetails,
      techStack,
      techTrends,
      careerProgressionSummary,
      analysisRawData
    } = data

    const query = `
      INSERT INTO resume_enrichment (
        candidate_id,
        promotion_speed,
        promotion_history,
        employment_gaps,
        gap_months,
        achievement_detail_score,
        skill_diversity_score,
        skill_diversity_details,
        tech_stack,
        tech_trends,
        career_progression_summary,
        analysis_raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (candidate_id) 
      DO UPDATE SET
        promotion_speed = $2,
        promotion_history = $3,
        employment_gaps = $4,
        gap_months = $5,
        achievement_detail_score = $6,
        skill_diversity_score = $7,
        skill_diversity_details = $8,
        tech_stack = $9,
        tech_trends = $10,
        career_progression_summary = $11,
        analysis_raw_data = $12,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `

    const result = await pool.query(query, [
      candidateId,
      promotionSpeed || 0,
      promotionHistory ? JSON.stringify(promotionHistory) : null,
      employmentGaps ? JSON.stringify(employmentGaps) : null,
      gapMonths || 0,
      achievementDetailScore || 0,
      skillDiversityScore || 0,
      skillDiversityDetails ? JSON.stringify(skillDiversityDetails) : null,
      techStack ? JSON.stringify(techStack) : null,
      techTrends ? JSON.stringify(techTrends) : null,
      careerProgressionSummary || '',
      analysisRawData ? JSON.stringify(analysisRawData) : null
    ])

    return result.rows[0]
  },

  // Lấy kết quả phân tích nâng cao
  getEnrichment: async (candidateId) => {
    const result = await pool.query(
      'SELECT * FROM resume_enrichment WHERE candidate_id = $1',
      [candidateId]
    )
    return result.rows[0]
  },

  // Kiểm tra đã phân tích chưa
  hasEnrichment: async (candidateId) => {
    const result = await pool.query(
      'SELECT id FROM resume_enrichment WHERE candidate_id = $1',
      [candidateId]
    )
    return result.rows.length > 0
  },

  // Xóa phân tích
  deleteEnrichment: async (candidateId) => {
    await pool.query(
      'DELETE FROM resume_enrichment WHERE candidate_id = $1',
      [candidateId]
    )
    return true
  }
}

export default resumeEnrichmentModel