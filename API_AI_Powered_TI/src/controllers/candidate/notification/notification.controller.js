import notificationService from '~/services/notification/notification.service'
import candidateProfileModel from '~/models/candidate/candidate-profile.model'

const resolveCandidateId = async (userId) => {
  const profile = await candidateProfileModel.findByUserId(userId)
  return profile ? profile.id : userId
}

const candidateNotificationController = {
  // Lấy danh sách thông báo
  getNotifications: async (req, res) => {
    try {
      const candidateId = await resolveCandidateId(req.user.id)
      const { limit = 20, page = 1 } = req.query

      const result = await notificationService.getByCandidate(
        candidateId,
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
      const candidateId = await resolveCandidateId(req.user.id)

      const notifications = await notificationService.getUnread(candidateId, 'candidate')
      const count = await notificationService.countUnread(candidateId, 'candidate')

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
      const candidateId = await resolveCandidateId(req.user.id)

      const count = await notificationService.countUnread(candidateId, 'candidate')

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
      const candidateId = await resolveCandidateId(req.user.id)

      const result = await notificationService.markAllAsRead(candidateId, 'candidate')

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
      const candidateId = await resolveCandidateId(req.user.id)

      await notificationService.deleteAll(candidateId, 'candidate')

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

export default candidateNotificationController