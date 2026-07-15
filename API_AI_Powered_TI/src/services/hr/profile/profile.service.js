import profileModel from '~/models/hr/profile/profile.model'
import bcrypt from 'bcryptjs'

const profileService = {
  // Lấy thông tin công ty
  getCompany: async (companyId) => {
    const company = await profileModel.getCompany(companyId)
    if (!company) {
      throw new Error('Không tìm thấy công ty')
    }
    return company
  },

  // Cập nhật thông tin công ty
  updateCompany: async (companyId, data) => {
    return await profileModel.updateCompany(companyId, data)
  },

  // Lấy thông tin HR
  getHRProfile: async (userId) => {
    const profile = await profileModel.getHRProfile(userId)
    if (!profile) {
      throw new Error('Không tìm thấy thông tin người dùng')
    }
    return profile
  },

  // Cập nhật thông tin HR
  updateHRProfile: async (userId, data) => {
    return await profileModel.updateHRProfile(userId, data)
  },

  // Cập nhật avatar
  updateAvatar: async (userId, avatarData) => {
    return await profileModel.updateAvatar(userId, avatarData)
  },

  // Đổi mật khẩu
  changePassword: async (userId, currentPassword, newPassword) => {
    // 1. Lấy password hash hiện tại
    const currentHash = await profileModel.getPasswordHash(userId)
    if (!currentHash) {
      throw new Error('Tài khoản này chưa có mật khẩu. Vui lòng đăng nhập bằng Google.')
    }

    // 2. Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, currentHash)
    if (!isMatch) {
      throw new Error('Mật khẩu hiện tại không đúng')
    }

    // 3. Mã hóa mật khẩu mới
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // 4. Cập nhật mật khẩu
    return await profileModel.changePassword(userId, hashedPassword)
  }
}

export default profileService