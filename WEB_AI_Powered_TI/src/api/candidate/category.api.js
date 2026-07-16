import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const categoryApi = {

  // Lấy tất cả category (cho candidate)
  getAllCategories: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/categories`)
    return response.data
  },

  // Lấy category theo slug
  getCategoryBySlug: async (slug) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/categories/slug/${slug}`)
    return response.data
  },

  // Lấy category theo ID
  getCategoryByIdPublic: async (id) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/categories/${id}`)
    return response.data
  }
}