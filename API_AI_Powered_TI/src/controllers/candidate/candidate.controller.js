import candidateService from '~/services/candidate/candidate.service'

const candidateController = {
  // Ứng tuyển công việc
  applyJob: async (req, res) => {
    try {
      const userId = req.user.id
      const file = req.file

      const result = await candidateService.applyJob(userId, req.body, file)

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách ứng tuyển
  getApplications: async (req, res) => {
    try {
      const userId = req.user.id
      const { status, limit, page } = req.query

      const applications = await candidateService.getApplications(userId, { status })

      // Đơn giản hóa pagination
      let result = applications
      if (limit && page) {
        const offset = (parseInt(page) - 1) * parseInt(limit)
        result = applications.slice(offset, offset + parseInt(limit))
      }

      return res.status(200).json({
        success: true,
        data: result,
        pagination: {
          total: applications.length,
          limit: parseInt(limit) || applications.length,
          page: parseInt(page) || 1,
          totalPages: limit ? Math.ceil(applications.length / parseInt(limit)) : 1
        }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy chi tiết ứng tuyển
  getApplicationDetail: async (req, res) => {
    try {
      const userId = req.user.id
      const { id } = req.params

      const application = await candidateService.getApplicationDetail(userId, id)

      return res.status(200).json({
        success: true,
        data: application
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy thông tin hồ sơ
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id
      const profile = await candidateService.getProfile(userId)

      return res.status(200).json({
        success: true,
        data: profile
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Cập nhật hồ sơ
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id
      const { fullname, phone, address } = req.body

      const updated = await candidateService.updateProfile(userId, {
        fullname,
        phone,
        address
      })

      // Remove sensitive data
      delete updated.password_hash
      delete updated.refresh_token

      return res.status(200).json({
        success: true,
        data: updated
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Upload avatar
  uploadAvatar: async (req, res) => {
    try {
      const userId = req.user.id
      const file = req.file

      const result = await candidateService.uploadAvatar(userId, file)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật avatar thành công',
        data: {
          avatar: result.avatar
        }
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id
      const { currentPassword, newPassword } = req.body

      const result = await candidateService.changePassword(userId, {
        currentPassword,
        newPassword
      })

      return res.status(200).json({
        success: true,
        message: result.message
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  getApplicationCount: async (req, res) => {
    try {
      const userId = req.user.id
      const count = await candidateService.getApplicationCount(userId)
      return res.status(200).json({
        success: true,
        data: { count }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Cập nhật trạng thái ứng tuyển
  updateApplicationStatus: async (req, res) => {
    try {
      const userId = req.user.id
      const { id } = req.params
      const { status } = req.body

      const application = await candidateService.updateApplicationStatus(userId, id, status)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: application
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa ứng tuyển
  deleteApplication: async (req, res) => {
    try {
      const userId = req.user.id
      const { id } = req.params

      await candidateService.deleteApplication(userId, id)

      return res.status(200).json({
        success: true,
        message: 'Xóa ứng tuyển thành công'
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default candidateController