import notificationService from '~/services/notification/notification.service'

const hrNotificationController = {
  // Lấy danh sách thông báo
  getNotifications: async (req, res) => {
    try {
      const userId = req.user.id
      const { limit = 20, page = 1 } = req.query

      const result = await notificationService.getByHR(
        userId,
        parseInt(limit),
        parseInt(page)
      )

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy thông báo chưa đọc
  getUnread: async (req, res) => {
    try {
      const userId = req.user.id

      const notifications = await notificationService.getUnread(userId, 'hr')
      const count = await notificationService.countUnread(userId, 'hr')

      return res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount: count
        }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Đếm thông báo chưa đọc
  countUnread: async (req, res) => {
    try {
      const userId = req.user.id

      const count = await notificationService.countUnread(userId, 'hr')

      return res.status(200).json({
        success: true,
        data: { unreadCount: count }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Đánh dấu đã đọc
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params

      const result = await notificationService.markAsRead(id)

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu đã đọc',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user.id

      const result = await notificationService.markAllAsRead(userId, 'hr')

      return res.status(200).json({
        success: true,
        message: 'Đã đánh dấu tất cả đã đọc',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa thông báo
  delete: async (req, res) => {
    try {
      const { id } = req.params

      await notificationService.delete(id)

      return res.status(200).json({
        success: true,
        message: 'Xóa thông báo thành công'
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa tất cả thông báo
  deleteAll: async (req, res) => {
    try {
      const userId = req.user.id

      await notificationService.deleteAll(userId, 'hr')

      return res.status(200).json({
        success: true,
        message: 'Xóa tất cả thông báo thành công'
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default hrNotificationController