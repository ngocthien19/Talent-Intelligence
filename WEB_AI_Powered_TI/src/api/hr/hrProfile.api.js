import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const hrProfileApi = {
  // Lấy thông tin HR
  getProfile: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/hr/profile`)
    return response.data
  },

  // Cập nhật thông tin HR
  updateProfile: async (data) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/hr/profile`, data)
    return response.data
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/profile/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  // Đổi mật khẩu
  changePassword: async (data) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/hr/profile/change-password`,
      data
    )
    return response.data
  },

  // Lấy thông tin công ty
  getCompany: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/hr/company`)
    return response.data
  },

  // Cập nhật thông tin công ty
  updateCompany: async (data) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/hr/company`, data)
    return response.data
  },

  // Upload logo & banner
  uploadCompanyFiles: async (formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/company/upload`,
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

export default hrProfileApi