import candidateService from '~/services/candidate/candidate.service'

const candidateController = {
  // Ứng tuyển công việc
  applyJob: async (req, res) => {
    try {
      const userId = req.user.id
      const file = req.file

      const result = await candidateService.applyJob(
        { ...req.body, user_id: userId },
        file
      )

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
      const applications = await candidateService.getApplications(userId)

      return res.status(200).json({
        success: true,
        data: applications
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
  }
}

export default candidateController