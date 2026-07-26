import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const analyticsApi = {
  // Lấy danh sách ứng viên chưa phân tích
  getUnanalyzedCandidates: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const url = `${DEV_API_URL}/api/hr/applications/unanalyzed${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await authorizedAxiosInstance.get(url)
    return response.data
  },

  analyzeCandidate: async (applicationId) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/candidates/${applicationId}/analyze`
    )
    return response.data
  },

  getAnalysisResult: async (applicationId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/candidates/${applicationId}/analysis`
    )
    return response.data
  },

  enrichResume: async (applicationId) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/resume/${applicationId}/enrich`
    )
    return response.data
  },

  getEnrichment: async (applicationId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/resume/${applicationId}/enrichment`
    )
    return response.data
  },

  sendReport: async (applicationId) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/reports/${applicationId}/send-report`
    )
    return response.data
  },

  checkReportSent: async (applicationId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/reports/${applicationId}/report-status`
    )
    return response.data
  }
}

export default analyticsApi