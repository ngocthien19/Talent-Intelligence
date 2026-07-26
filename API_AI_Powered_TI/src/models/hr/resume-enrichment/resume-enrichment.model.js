import pool from '~/config/db.js'

const resumeEnrichmentModel = {
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

    const profileResult = await pool.query(
      'SELECT candidate_profile_id FROM applications WHERE id = $1',
      [candidateId]
    )

    if (profileResult.rows.length === 0) {
      throw new Error('Không tìm thấy ứng viên')
    }

    const candidateProfileId = profileResult.rows[0].candidate_profile_id

    // Kiểm tra xem đã có record chưa
    const existing = await pool.query(
      'SELECT id FROM resume_enrichment WHERE candidate_id = $1',
      [candidateProfileId]
    )

    let query
    let params

    if (existing.rows.length > 0) {
      query = `
        UPDATE resume_enrichment
        SET 
          promotion_speed = $1,
          promotion_history = $2,
          employment_gaps = $3,
          gap_months = $4,
          achievement_detail_score = $5,
          skill_diversity_score = $6,
          skill_diversity_details = $7,
          tech_stack = $8,
          tech_trends = $9,
          career_progression_summary = $10,
          analysis_raw_data = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE candidate_id = $12
        RETURNING *
      `
      params = [
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
        analysisRawData ? JSON.stringify(analysisRawData) : null,
        candidateProfileId
      ]
    } else {
      query = `
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
        RETURNING *
      `
      params = [
        candidateProfileId,
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
      ]
    }

    const result = await pool.query(query, params)
    return result.rows[0]
  },

  // Lấy kết quả phân tích nâng cao
  getEnrichment: async (applicationId) => {
    // Lấy candidate_profile_id từ application_id
    const profileResult = await pool.query(
      'SELECT candidate_profile_id FROM applications WHERE id = $1',
      [applicationId]
    )

    if (profileResult.rows.length === 0) {
      return null
    }

    const candidateProfileId = profileResult.rows[0].candidate_profile_id

    const result = await pool.query(
      'SELECT * FROM resume_enrichment WHERE candidate_id = $1',
      [candidateProfileId]
    )
    return result.rows[0]
  },

  // Kiểm tra đã phân tích chưa
  hasEnrichment: async (applicationId) => {
    const profileResult = await pool.query(
      'SELECT candidate_profile_id FROM applications WHERE id = $1',
      [applicationId]
    )

    if (profileResult.rows.length === 0) {
      return false
    }

    const candidateProfileId = profileResult.rows[0].candidate_profile_id

    const result = await pool.query(
      'SELECT id FROM resume_enrichment WHERE candidate_id = $1',
      [candidateProfileId]
    )
    return result.rows.length > 0
  },

  // Xóa phân tích
  deleteEnrichment: async (applicationId) => {
    const profileResult = await pool.query(
      'SELECT candidate_profile_id FROM applications WHERE id = $1',
      [applicationId]
    )

    if (profileResult.rows.length === 0) {
      return true
    }

    const candidateProfileId = profileResult.rows[0].candidate_profile_id

    await pool.query(
      'DELETE FROM resume_enrichment WHERE candidate_id = $1',
      [candidateProfileId]
    )
    return true
  }
}

export default resumeEnrichmentModel