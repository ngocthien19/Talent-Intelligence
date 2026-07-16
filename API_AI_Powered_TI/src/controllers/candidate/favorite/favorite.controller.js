import favoriteService from '~/services/candidate/favorite/favorite.service'

const favoriteController = {
  // Toggle yêu thích (thêm/xóa)
  toggleFavorite: async (req, res) => {
    try {
      const { jobId } = req.body
      const userId = req.user.id

      const result = await favoriteService.toggleFavorite(userId, jobId)

      return res.status(200).json({
        success: true,
        message: result.action === 'added' ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách yêu thích
  getFavorites: async (req, res) => {
    try {
      const userId = req.user.id
      const { limit = 20, page = 1 } = req.query

      const result = await favoriteService.getFavorites(userId, parseInt(limit), parseInt(page))

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Kiểm tra đã yêu thích chưa
  isFavorite: async (req, res) => {
    try {
      const { jobId } = req.params
      const userId = req.user.id

      const isFavorite = await favoriteService.isFavorite(userId, jobId)

      return res.status(200).json({
        success: true,
        data: {
          isFavorite,
          jobId
        }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy số lượng yêu thích của job
  getFavoriteCount: async (req, res) => {
    try {
      const { jobId } = req.params

      const count = await favoriteService.getFavoriteCount(jobId)

      return res.status(200).json({
        success: true,
        data: {
          jobId,
          favoriteCount: count
        }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa tất cả yêu thích
  clearFavorites: async (req, res) => {
    try {
      const userId = req.user.id

      await favoriteService.clearFavorites(userId)

      return res.status(200).json({
        success: true,
        message: 'Đã xóa tất cả yêu thích'
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default favoriteController