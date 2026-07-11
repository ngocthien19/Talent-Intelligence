import mockInterviewService from '~/services/candidate/mock-interview/mock-interview.service'

const mockInterviewController = {
  // BẮT ĐẦU PHỎNG VẤN
  startSession: async (req, res) => {
    try {
      const { candidateId, jobId, numberOfQuestions = 5 } = req.body
      const userId = req.user.id

      // Kiểm tra quyền: chỉ candidate mới được bắt đầu
      if (req.user.roleName !== 'candidate') {
        return res.status(403).json({
          success: false,
          message: 'Chỉ ứng viên mới có thể thực hiện hành động này'
        })
      }

      if (candidateId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thực hiện hành động này'
        })
      }

      const result = await mockInterviewService.startSession(candidateId, jobId, numberOfQuestions)

      return res.status(201).json({
        success: true,
        message: 'Bắt đầu phiên phỏng vấn thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // TRẢ LỜI CÂU HỎI
  answerQuestion: async (req, res) => {
    try {
      const { sessionId, questionId, answer } = req.body
      const userId = req.user.id

      const result = await mockInterviewService.answerQuestion(sessionId, questionId, answer, userId)

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

  // KẾT THÚC PHỎNG VẤN
  endSession: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      const session = await mockInterviewService.getSessionDetail(id, userId)
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy phiên phỏng vấn'
        })
      }

      const result = await mockInterviewService.endSession(id)

      return res.status(200).json({
        success: true,
        message: 'Kết thúc phiên phỏng vấn thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // LẤY LỊCH SỬ PHỎNG VẤN
  getHistory: async (req, res) => {
    try {
      const userId = req.user.id
      const { limit = 10 } = req.query

      const result = await mockInterviewService.getHistory(userId, parseInt(limit))

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

  // LẤY CHI TIẾT PHIÊN PHỎNG VẤN
  getSessionDetail: async (req, res) => {
    try {
      const { id } = req.params
      const userId = req.user.id

      const result = await mockInterviewService.getSessionDetail(id, userId)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default mockInterviewController