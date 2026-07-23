import pool from '~/config/db'

const dashboardModel = {
  buildDateCondition: (period, startDate, endDate) => {
    let condition = ''

    switch (period) {
      case 'today':
        condition = 'AND a.created_at::date = CURRENT_DATE'
        break
      case '7days':
        condition = 'AND a.created_at >= NOW() - INTERVAL \'7 days\''
        break
      case '30days':
        condition = 'AND a.created_at >= NOW() - INTERVAL \'30 days\''
        break
      case 'custom':
        if (startDate) {
          condition = `AND a.created_at::date >= '${startDate}'`
        }
        if (endDate) {
          condition += ` AND a.created_at::date <= '${endDate}'`
        }
        break
      default:
        condition = 'AND a.created_at >= NOW() - INTERVAL \'30 days\''
    }

    return condition
  },

  getTotalCandidates: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT COUNT(*) as total 
       FROM applications a
       WHERE a.company_id = $1
       ${dateCondition}`,
      [companyId]
    )
    return parseInt(result.rows[0]?.total || 0)
  },

  getCandidatesByStatus: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT a.status, COUNT(*) as count 
       FROM applications a
       WHERE a.company_id = $1
       ${dateCondition}
       GROUP BY a.status`,
      [companyId]
    )
    return result.rows
  },

  getNewCandidates: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM applications a
       WHERE a.company_id = $1
       ${dateCondition}`,
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  getRecentCandidates: async (companyId, dateCondition, limit = 5) => {
    const result = await pool.query(
      `SELECT a.id, a.position, a.status, a.overall_score, a.created_at,
              cp.name, cp.email, cp.phone, cp.cv_url,
              jd.title as job_title, jd.location as job_location,
              comp.name as company_name
       FROM applications a
       LEFT JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
       LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
       LEFT JOIN companies comp ON a.company_id = comp.id
       WHERE a.company_id = $1
       ${dateCondition}
       ORDER BY a.created_at DESC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  getAverageScores: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT 
        AVG(a.overall_score) as avg_overall,
        AVG(a.skills_match_score) as avg_skills_match,
        AVG(a.culture_fit_score) as avg_culture_fit,
        AVG(a.retention_score) as avg_retention
       FROM applications a
       WHERE a.company_id = $1
       AND a.overall_score IS NOT NULL
       ${dateCondition}`,
      [companyId]
    )
    return result.rows[0]
  },

  getTopSkills: async (companyId, dateCondition, limit = 10) => {
    const result = await pool.query(
      `SELECT 
        skill,
        COUNT(*) as count
       FROM applications a,
       LATERAL jsonb_array_elements_text(
         COALESCE(a.required_skills, '[]'::jsonb)
       ) AS skill
       WHERE a.company_id = $1
       ${dateCondition}
       GROUP BY skill
       ORDER BY count DESC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows || []
  },

  getDailyStats: async (companyId, dateCondition) => {
    let query = `
      SELECT 
        DATE(a.created_at) as date,
        COUNT(*) as count
       FROM applications a
       WHERE a.company_id = $1
    `

    if (dateCondition) {
      query += ` ${dateCondition}`
    }

    query += ' GROUP BY DATE(a.created_at) ORDER BY date ASC'

    const result = await pool.query(query, [companyId])
    return result.rows
  }
}

export default dashboardModel