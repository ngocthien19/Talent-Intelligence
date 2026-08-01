import favoriteService from '~/services/hr/favorite/favorite.service'

const favoriteController = {
  // Lấy danh sách ứng viên yêu thích công việc
  getCandidatesByJobId: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const { jobId } = req.params
      const { limit = 20, page = 1, keyword } = req.query

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required'
        })
      }

      const offset = (page - 1) * limit

      const result = await favoriteService.getCandidatesByJobId(jobId, companyId, {
        keyword,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy số lượng ứng viên yêu thích công việc
  getFavoriteCount: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const { jobId } = req.params

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required'
        })
      }

      const count = await favoriteService.getFavoriteCount(jobId, companyId)

      return res.status(200).json({
        success: true,
        data: {
          jobId,
          count
        }
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách công việc được yêu thích nhiều nhất
  getTopFavoriteJobs: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const { limit = 10 } = req.query

      const result = await favoriteService.getTopFavoriteJobs(companyId, {
        limit: parseInt(limit)
      })

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách ứng viên yêu thích nhiều công việc nhất
  getTopFavoriteCandidates: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const { limit = 10 } = req.query

      const result = await favoriteService.getTopFavoriteCandidates(companyId, {
        limit: parseInt(limit)
      })

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default favoriteController