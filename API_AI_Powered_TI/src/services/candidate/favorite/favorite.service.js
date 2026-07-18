import favoriteModel from '~/models/candidate/favorite/favorite.model'
import candidateService from '~/services/candidate/candidate.service'
import pool from '~/config/db'

const favoriteService = {
  toggleFavorite: async (userId, jobId) => {
    const profile = await candidateService.ensureProfileExists(userId)

    const jobResult = await pool.query(
      'SELECT id FROM job_descriptions WHERE id = $1 AND is_active = true',
      [jobId]
    )

    if (jobResult.rows.length === 0) {
      throw new Error('Không tìm thấy công việc')
    }

    return await favoriteModel.toggleFavorite(profile.id, jobId)
  },

  getFavorites: async (userId, limit = 20, page = 1) => {
    const profile = await candidateService.ensureProfileExists(userId)
    const offset = (page - 1) * limit
    return await favoriteModel.getFavorites(profile.id, parseInt(limit), parseInt(offset))
  },

  isFavorite: async (userId, jobId) => {
    const profile = await candidateService.ensureProfileExists(userId)
    return await favoriteModel.isFavorite(profile.id, jobId)
  },

  // FIX BUG: gọi đúng hàm
  getFavoriteCount: async (jobId) => {
    return await favoriteModel.getFavoriteCount(jobId)
  },

  clearFavorites: async (userId) => {
    const profile = await candidateService.ensureProfileExists(userId)
    return await favoriteModel.clearFavorites(profile.id)
  }
}

export default favoriteService