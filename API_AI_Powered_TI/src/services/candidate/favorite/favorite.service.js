import favoriteModel from '~/models/candidate/favorite/favorite.model'
import candidateModel from '~/models/candidate/candidate.model'
import pool from '~/config/db.js'

const favoriteService = {
  // Toggle yêu thích
  toggleFavorite: async (userId, jobId) => {
    const candidate = await candidateModel.getCandidateByUserId(userId)
    if (!candidate) {
      throw new Error('Không tìm thấy hồ sơ ứng viên. Vui lòng tạo hồ sơ trước.')
    }

    const candidateId = candidate.id

    // Kiểm tra job tồn tại
    const jobResult = await pool.query(
      'SELECT id FROM job_descriptions WHERE id = $1 AND is_active = true',
      [jobId]
    )

    if (jobResult.rows.length === 0) {
      throw new Error('Không tìm thấy công việc')
    }

    return await favoriteModel.toggleFavorite(candidateId, jobId)
  },

  // Lấy danh sách yêu thích
  getFavorites: async (userId, limit = 20, page = 1) => {
    const candidate = await candidateModel.getCandidateByUserId(userId)
    if (!candidate) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    const candidateId = candidate.id
    const offset = (page - 1) * limit
    return await favoriteModel.getFavorites(candidateId, parseInt(limit), parseInt(offset))
  },

  // Kiểm tra đã yêu thích chưa
  isFavorite: async (userId, jobId) => {
    const candidate = await candidateModel.getCandidateByUserId(userId)
    if (!candidate) {
      return false
    }

    const candidateId = candidate.id
    return await favoriteModel.isFavorite(candidateId, jobId)
  },

  // Lấy số lượng yêu thích của job
  getFavoriteCount: async (jobId) => {
    return await favoriteModel.getCandidateByUserId(jobId)
  },

  // Xóa tất cả yêu thích
  clearFavorites: async (userId) => {
    const candidate = await candidateModel.getCandidateByUserId(userId)
    if (!candidate) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    const candidateId = candidate.id
    return await favoriteModel.clearFavorites(candidateId)
  }
}

export default favoriteService