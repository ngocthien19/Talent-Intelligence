import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const profileApi = {
  // Lấy thông tin profile
  getProfile: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/candidates/profile`)
    return response.data
  },

  // Cập nhật profile
  updateProfile: async (data) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/candidates/profile`, data)
    return response.data
  },

  // Đổi mật khẩu
  changePassword: async (data) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/candidates/change-password`,
      data
    )
    return response.data
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/candidates/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }
}