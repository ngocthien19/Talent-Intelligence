import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

const API_URL = `${DEV_API_URL}/api/hr/resume`

export const enrichmentApi = {
  // Chạy phân tích nâng cao (đồng bộ, trả kết quả ngay)
  analyzeResume: async (id) => {
    const response = await authorizedAxiosInstance.post(`${API_URL}/${id}/enrich`)
    return response.data
  },

  getEnrichment: async (id) => {
    const response = await authorizedAxiosInstance.get(`${API_URL}/${id}/enrichment`)
    return response.data
  },

  checkEnrichment: async (id) => {
    const response = await authorizedAxiosInstance.get(`${API_URL}/${id}/enrichment/check`)
    return response.data
  },

  deleteEnrichment: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${API_URL}/${id}/enrichment`)
    return response.data
  }
}

export default enrichmentApi