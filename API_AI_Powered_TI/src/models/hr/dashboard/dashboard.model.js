import pool from '~/config/db.js'

const dashboardModel = {
  buildDateCondition: (period, startDate, endDate) => {
    let condition = ''

    switch (period) {
      case 'today':
        condition = 'AND c.created_at::date = CURRENT_DATE'
        break
      case '7days':
        condition = 'AND c.created_at >= NOW() - INTERVAL \'7 days\''
        break
      case '30days':
        condition = 'AND c.created_at >= NOW() - INTERVAL \'30 days\''
        break
      case 'custom':
        if (startDate) {
          condition = `AND c.created_at::date >= '${startDate}'`
        }
        if (endDate) {
          condition += ` AND c.created_at::date <= '${endDate}'`
        }
        break
      default:
        // Mặc định: 30 ngày
        condition = 'AND c.created_at >= NOW() - INTERVAL \'30 days\''
    }

    return condition
  },

  // Lấy tổng số ứng viên theo công ty
  getTotalCandidates: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT COUNT(*) as total 
       FROM candidates c
       WHERE c.company_id = $1
       ${dateCondition}`,
      [companyId]
    )
    return parseInt(result.rows[0]?.total || 0)
  },

  // Lấy số ứng viên theo trạng thái
  getCandidatesByStatus: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT c.status, COUNT(*) as count 
       FROM candidates c
       WHERE c.company_id = $1
       ${dateCondition}
       GROUP BY c.status`,
      [companyId]
    )
    return result.rows
  },

  // Lấy số ứng viên mới (theo filter)
  getNewCandidates: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM candidates c
       WHERE c.company_id = $1
       ${dateCondition}`,
      [companyId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Lấy ứng viên mới nhất
  getRecentCandidates: async (companyId, dateCondition, limit = 5) => {
    const result = await pool.query(
      `SELECT c.*, jd.title as job_title, jd.location as job_location,
              comp.name as company_name
       FROM candidates c
       LEFT JOIN job_descriptions jd ON c.jd_id = jd.id
       LEFT JOIN companies comp ON c.company_id = comp.id
       WHERE c.company_id = $1
       ${dateCondition}
       ORDER BY c.created_at DESC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  // Lấy điểm trung bình của ứng viên
  getAverageScores: async (companyId, dateCondition) => {
    const result = await pool.query(
      `SELECT 
        AVG(c.overall_score) as avg_overall,
        AVG(c.skills_match_score) as avg_skills_match,
        AVG(c.culture_fit_score) as avg_culture_fit,
        AVG(c.retention_score) as avg_retention
       FROM candidates c
       WHERE c.company_id = $1
       AND c.overall_score IS NOT NULL
       ${dateCondition}`,
      [companyId]
    )
    return result.rows[0]
  },

  // Lấy phân bố kỹ năng (top skills)
  getTopSkills: async (companyId, dateCondition, limit = 10) => {
    const result = await pool.query(
      `SELECT 
        skill,
        COUNT(*) as count
       FROM (
         SELECT jsonb_array_elements_text(c.parsed_data->'skills') as skill
         FROM candidates c
         WHERE c.company_id = $1
         AND c.parsed_data->'skills' IS NOT NULL
         ${dateCondition}
       ) s
       GROUP BY skill
       ORDER BY count DESC
       LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  // Lấy thống kê theo ngày
  getDailyStats: async (companyId, dateCondition) => {
    let query = `
      SELECT 
        DATE(c.created_at) as date,
        COUNT(*) as count
       FROM candidates c
       WHERE c.company_id = $1
    `

    // Nếu có dateCondition, thêm vào
    if (dateCondition) {
      query += ` ${dateCondition}`
    }

    query += ' GROUP BY DATE(c.created_at) ORDER BY date ASC'

    const result = await pool.query(query, [companyId])
    return result.rows
  }
}

export default dashboardModel