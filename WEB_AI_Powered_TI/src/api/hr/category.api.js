import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const categoryApi = {
  // Lấy danh sách category (có filter)
  getCategories: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const url = `${DEV_API_URL}/api/hr/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await authorizedAxiosInstance.get(url)
    return response.data
  },

  // Lấy chi tiết category
  getCategoryById: async (id) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/categories/${id}`
    )
    return response.data
  },

  // Tạo category mới
  createCategory: async (data) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/categories`,
      data
    )
    return response.data
  },

  // Cập nhật category
  updateCategory: async (id, data) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/hr/categories/${id}`,
      data
    )
    return response.data
  },

  // Cập nhật trạng thái (single)
  updateStatus: async (id, isActive) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/hr/categories/${id}/status`,
      { isActive }
    )
    return response.data
  },

  // Cập nhật trạng thái hàng loạt (bulk)
  updateStatusBulk: async (ids, isActive) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/hr/categories/status/bulk`,
      { ids, isActive }
    )
    return response.data
  },

  // Xóa category (single)
  deleteCategory: async (id) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/hr/categories/${id}`
    )
    return response.data
  },

  // Xóa hàng loạt (bulk)
  deleteBulk: async (ids) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/categories/bulk-delete`,
      { ids }
    )
    return response.data
  },

  // Lấy thống kê
  getStats: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/categories/stats`
    )
    return response.data
  },

  // Lấy dropdown
  getDropdown: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/categories/dropdown`
    )
    return response.data
  }
}

export default categoryApi