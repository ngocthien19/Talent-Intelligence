import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const categoryApi = {
  // Lấy danh sách category (cho dropdown)
  getDropdown: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/hr/categories/dropdown`)
    return response.data
  },

  // Lấy danh sách category có phân trang
  getCategories: async (params = {}) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/hr/categories`, { params })
    return response.data
  }
}