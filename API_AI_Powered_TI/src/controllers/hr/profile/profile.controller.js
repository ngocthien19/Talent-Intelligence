import profileService from '~/services/hr/profile/profile.service'

const profileController = {
  // Lấy thông tin công ty
  getCompany: async (req, res) => {
    try {
      const companyId = req.user.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy công ty'
        })
      }

      const result = await profileService.getCompany(companyId)

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

  // Cập nhật thông tin công ty
  updateCompany: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const data = req.body

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy công ty'
        })
      }

      const result = await profileService.updateCompany(companyId, data)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin công ty thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Upload logo & banner cho công ty
  uploadCompanyFiles: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const files = req.files

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy công ty'
        })
      }

      const updateData = {}

      // Xử lý logo
      if (files?.logo && files.logo.length > 0) {
        const logoFile = files.logo[0]
        updateData.logo = {
          secure_url: logoFile.path,
          public_id: logoFile.filename || logoFile.public_id,
          format: logoFile.format,
          size: logoFile.size
        }
      }

      // Xử lý banner
      if (files?.banner && files.banner.length > 0) {
        const bannerFile = files.banner[0]
        updateData.banner = {
          secure_url: bannerFile.path,
          public_id: bannerFile.filename || bannerFile.public_id,
          format: bannerFile.format,
          size: bannerFile.size
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ảnh logo hoặc banner'
        })
      }

      const result = await profileService.updateCompany(companyId, updateData)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật logo/banner thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy thông tin HR
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id

      const result = await profileService.getHRProfile(userId)

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

  // Cập nhật thông tin HR
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id
      const { fullname, phone, address } = req.body

      const result = await profileService.updateHRProfile(userId, {
        fullname,
        phone,
        address
      })

      return res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
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

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn ảnh'
        })
      }

      // File đã được CloudinaryStorage upload, lấy thông tin từ file
      const avatarData = {
        secure_url: file.path,
        public_id: file.filename || file.public_id,
        format: file.format,
        size: file.size
      }

      const updated = await profileService.updateAvatar(userId, avatarData)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật avatar thành công',
        data: {
          avatar: avatarData,
          user: updated
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

      const result = await profileService.changePassword(userId, currentPassword, newPassword)

      return res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công',
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

export default profileController