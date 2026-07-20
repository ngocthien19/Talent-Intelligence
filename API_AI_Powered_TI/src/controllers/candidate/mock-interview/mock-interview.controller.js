import mockInterviewService from '~/services/candidate/mock-interview/mock-interview.service'

const mockInterviewController = {
  // Tạo phiên phỏng vấn mới
  createSession: async (req, res) => {
    try {
      const userId = req.user.id

      if (req.user.roleName !== 'candidate') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ ứng viên mới có thể thực hiện hành động này'
        })
      }

      const result = await mockInterviewService.createSession(userId)

      return res.status(201).json({
        success: true,
        message: 'Tạo phiên phỏng vấn thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Gửi tin nhắn (chat)
  sendMessage: async (req, res) => {
    try {
      const { sessionId, message } = req.body
      const userId = req.user.id

      const result = await mockInterviewService.sendMessage(sessionId, userId, message)

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

  // Lấy lịch sử chat
  getChatHistory: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      const history = await mockInterviewService.getChatHistory(id, userId)

      return res.status(200).json({
        success: true,
        data: history
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách phiên
  getSessions: async (req, res) => {
    try {
      const userId = req.user.id

      const sessions = await mockInterviewService.getSessions(userId)

      return res.status(200).json({
        success: true,
        data: sessions
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa phiên
  deleteSession: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      await mockInterviewService.deleteSession(id, userId)

      return res.status(200).json({
        success: true,
        message: 'Xóa phiên phỏng vấn thành công'
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default mockInterviewController