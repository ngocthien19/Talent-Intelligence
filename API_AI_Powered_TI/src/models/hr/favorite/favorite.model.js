import pool from '~/config/db'

const favoriteModel = {
  // Lấy danh sách ứng viên yêu thích công việc
  getCandidatesByJobId: async (jobId, { keyword, limit, offset }) => {
    const conditions = []
    const params = []
    let paramIndex = 1

    // Điều kiện job_id
    conditions.push(`fj.job_id = $${paramIndex}`)
    params.push(jobId)
    paramIndex++

    // Tìm kiếm theo từ khóa (tên ứng viên hoặc email)
    if (keyword && keyword.trim()) {
      conditions.push(`(cp.name ILIKE $${paramIndex} OR cp.email ILIKE $${paramIndex})`)
      params.push(`%${keyword.trim()}%`)
      paramIndex++
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Đếm tổng số
    const countQuery = `
      SELECT COUNT(*) as total
      FROM favorite_jobs fj
      INNER JOIN candidate_profiles cp ON fj.candidate_id = cp.id
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const total = parseInt(countResult.rows[0]?.total || 0)

    // Lấy dữ liệu
    const dataQuery = `
      SELECT 
        cp.id as candidate_id,
        cp.user_id,
        cp.name as candidate_name,
        cp.email as candidate_email,
        cp.phone as candidate_phone,
        cp.avatar as candidate_avatar,
        cp.skills as candidate_skills,
        cp.job_preferences,
        fj.created_at as favorited_at,
        u.created_at as joined_at
      FROM favorite_jobs fj
      INNER JOIN candidate_profiles cp ON fj.candidate_id = cp.id
      LEFT JOIN users u ON cp.user_id = u.id
      ${whereClause}
      ORDER BY fj.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `

    const dataParams = [...params, limit, offset]
    const result = await pool.query(dataQuery, dataParams)

    return {
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        totalPages: Math.ceil(total / limit)
      }
    }
  },

  // Lấy số lượng ứng viên yêu thích công việc
  getFavoriteCount: async (jobId) => {
    const result = await pool.query(
      `SELECT COUNT(*) as count 
       FROM favorite_jobs 
       WHERE job_id = $1`,
      [jobId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Lấy danh sách công việc được yêu thích nhiều nhất
  getTopFavoriteJobs: async (companyId, { limit }) => {
    const result = await pool.query(
      `SELECT 
        jd.id as job_id,
        jd.title as job_title,
        jd.experience_level,
        jd.employment_type,
        jd.location,
        jd.is_active,
        cat.name as category_name,
        COUNT(fj.job_id) as favorite_count,
        ARRAY_AGG(DISTINCT cp.name) as candidate_names
      FROM job_descriptions jd
      LEFT JOIN favorite_jobs fj ON jd.id = fj.job_id
      LEFT JOIN category_job cat ON jd.category_id = cat.id
      LEFT JOIN candidate_profiles cp ON fj.candidate_id = cp.id
      WHERE jd.company_id = $1
      GROUP BY jd.id, cat.name
      ORDER BY favorite_count DESC, jd.created_at DESC
      LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  // Lấy danh sách ứng viên yêu thích nhiều công việc nhất
  getTopFavoriteCandidates: async (companyId, { limit }) => {
    const result = await pool.query(
      `SELECT 
        cp.id as candidate_id,
        cp.name as candidate_name,
        cp.email as candidate_email,
        cp.avatar as candidate_avatar,
        cp.skills as candidate_skills,
        COUNT(fj.candidate_id) as favorite_count,
        ARRAY_AGG(DISTINCT jd.title) as job_titles,
        MAX(fj.created_at) as last_favorited_at
      FROM favorite_jobs fj
      INNER JOIN candidate_profiles cp ON fj.candidate_id = cp.id
      INNER JOIN job_descriptions jd ON fj.job_id = jd.id
      WHERE jd.company_id = $1
      GROUP BY cp.id
      ORDER BY favorite_count DESC
      LIMIT $2`,
      [companyId, limit]
    )
    return result.rows
  },

  // Kiểm tra job có thuộc company không
  checkJobBelongsToCompany: async (jobId, companyId) => {
    const result = await pool.query(
      `SELECT id FROM job_descriptions 
       WHERE id = $1 AND company_id = $2`,
      [jobId, companyId]
    )
    return result.rows.length > 0
  }
}

export default favoriteModel