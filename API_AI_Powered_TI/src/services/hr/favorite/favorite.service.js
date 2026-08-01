import favoriteModel from '~/models/hr/favorite/favorite.model'

const favoriteService = {
  // Lấy danh sách ứng viên yêu thích công việc
  getCandidatesByJobId: async (jobId, companyId, { keyword, limit, offset }) => {
    if (!jobId) {
      throw new Error('Job ID is required')
    }

    if (!companyId) {
      throw new Error('Company ID is required')
    }

    // Kiểm tra job có thuộc company không
    const jobExists = await favoriteModel.checkJobBelongsToCompany(jobId, companyId)
    if (!jobExists) {
      throw new Error('Job not found or does not belong to your company')
    }

    const result = await favoriteModel.getCandidatesByJobId(jobId, {
      keyword,
      limit,
      offset
    })

    return result
  },

  // Lấy số lượng ứng viên yêu thích công việc
  getFavoriteCount: async (jobId, companyId) => {
    if (!jobId) {
      throw new Error('Job ID is required')
    }

    if (!companyId) {
      throw new Error('Company ID is required')
    }

    // Kiểm tra job có thuộc company không
    const jobExists = await favoriteModel.checkJobBelongsToCompany(jobId, companyId)
    if (!jobExists) {
      throw new Error('Job not found or does not belong to your company')
    }

    return await favoriteModel.getFavoriteCount(jobId)
  },

  // Lấy danh sách công việc được yêu thích nhiều nhất
  getTopFavoriteJobs: async (companyId, { limit }) => {
    if (!companyId) {
      throw new Error('Company ID is required')
    }

    return await favoriteModel.getTopFavoriteJobs(companyId, { limit })
  },

  // Lấy danh sách ứng viên yêu thích nhiều công việc nhất
  getTopFavoriteCandidates: async (companyId, { limit }) => {
    if (!companyId) {
      throw new Error('Company ID is required')
    }

    return await favoriteModel.getTopFavoriteCandidates(companyId, { limit })
  }
}

export default favoriteService