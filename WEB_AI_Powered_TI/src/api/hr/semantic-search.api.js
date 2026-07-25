import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const semanticSearchApi = {

  semanticSearch: async (q, filters = {}) => {
    const params = new URLSearchParams()
    params.append('q', q)

    if (filters.status) params.append('status', filters.status)
    if (filters.minScore) params.append('minScore', filters.minScore)
    if (filters.maxScore) params.append('maxScore', filters.maxScore)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/search?${params.toString()}`
    )
    return response.data
  },

  generateEmbedding: async (applicationId) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/search/embedding/${applicationId}`
    )
    return response.data
  },

  generateAllEmbeddings: async () => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/search/embedding/all`
    )
    return response.data
  },

  checkEmbedding: async (applicationId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/search/embedding/${applicationId}/check`
    )
    return response.data
  },

  deleteEmbedding: async (applicationId) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/hr/search/embedding/${applicationId}`
    )
    return response.data
  }
}

export default semanticSearchApi