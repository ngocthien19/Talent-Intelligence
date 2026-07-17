import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const applicationApi = {
  // Ứng tuyển công việc
  applyJob: async (formData) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/candidates/apply`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  },

  // Lấy danh sách đã ứng tuyển
  getApplications: async (params = {}) => {
    const { limit = 20, page = 1, status } = params
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/candidates/applications`,
      { params: { limit, page, status } }
    )
    return response.data
  },

  // Lấy chi tiết ứng tuyển
  getApplicationDetail: async (applicationId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/candidates/applications/${applicationId}`
    )
    return response.data
  }
}