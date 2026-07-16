import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const favoriteApi = {
  // Toggle yêu thích (thêm/xóa)
  toggleFavorite: async (jobId) => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/candidate/favorites/toggle`, { jobId })
    return response.data
  },

  // Lấy danh sách yêu thích
  getFavorites: async (params = {}) => {
    const { limit = 20, page = 1 } = params
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/candidate/favorites`, {
      params: { limit, page }
    })
    return response.data
  },

  // Kiểm tra đã yêu thích chưa
  checkFavorite: async (jobId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/candidate/favorites/${jobId}/check`)
    return response.data
  },

  // Lấy số lượng yêu thích của job
  getFavoriteCount: async (jobId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/candidate/favorites/${jobId}/count`)
    return response.data
  },

  // Xóa tất cả yêu thích
  clearFavorites: async () => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/candidate/favorites/clear`)
    return response.data
  }
}