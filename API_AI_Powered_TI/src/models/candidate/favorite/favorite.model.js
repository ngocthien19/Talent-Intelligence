import pool from '~/config/db'

const favoriteModel = {
  // Toggle yêu thích (thêm/xóa)
  toggleFavorite: async (candidateId, jobId) => {
    // Kiểm tra đã tồn tại chưa
    const existing = await pool.query(
      'SELECT id FROM favorite_jobs WHERE candidate_id = $1 AND job_id = $2',
      [candidateId, jobId]
    )

    if (existing.rows.length > 0) {
      // Đã tồn tại -> Xóa
      await pool.query(
        'DELETE FROM favorite_jobs WHERE candidate_id = $1 AND job_id = $2',
        [candidateId, jobId]
      )
      return { action: 'removed', candidateId, jobId }
    }

    // Chưa tồn tại -> Thêm
    const result = await pool.query(
      `INSERT INTO favorite_jobs (candidate_id, job_id)
       VALUES ($1, $2)
       RETURNING *`,
      [candidateId, jobId]
    )
    return { action: 'added', data: result.rows[0] }
  },

  // Lấy danh sách yêu thích
  getFavorites: async (candidateId, limit = 20, offset = 0) => {
    const query = `
      SELECT f.id, f.created_at,
             j.id as job_id, j.title, j.description, j.requirements,
             j.benefits, j.required_skills, j.nice_to_have_skills,
             j.experience_level, j.employment_type, j.location,
             j.salary_range, j.created_at as job_created_at,
             c.name as company_name, c.logo as company_logo,
             cat.name as category_name
      FROM favorite_jobs f
      JOIN job_descriptions j ON f.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN category_job cat ON j.category_id = cat.id
      WHERE f.candidate_id = $1
      ORDER BY f.created_at DESC
      LIMIT $2 OFFSET $3
    `

    const result = await pool.query(query, [candidateId, limit, offset])

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM favorite_jobs WHERE candidate_id = $1',
      [candidateId]
    )
    const total = parseInt(countResult.rows[0]?.total || 0)

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

  // Kiểm tra đã yêu thích chưa
  isFavorite: async (candidateId, jobId) => {
    const result = await pool.query(
      'SELECT id FROM favorite_jobs WHERE candidate_id = $1 AND job_id = $2',
      [candidateId, jobId]
    )
    return result.rows.length > 0
  },

  // Lấy số lượng yêu thích của job
  getFavoriteCount: async (jobId) => {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM favorite_jobs WHERE job_id = $1',
      [jobId]
    )
    return parseInt(result.rows[0]?.count || 0)
  },

  // Xóa tất cả yêu thích của candidate
  clearFavorites: async (candidateId) => {
    await pool.query(
      'DELETE FROM favorite_jobs WHERE candidate_id = $1',
      [candidateId]
    )
    return true
  }
}

export default favoriteModel