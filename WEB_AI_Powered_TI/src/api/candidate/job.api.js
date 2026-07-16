import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const jobApi = {
  // Lấy danh sách công việc với filter
  getJobs: async (params = {}) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs`, { params })
    return response.data
  },

  // Lấy chi tiết công việc
  getJobDetail: async (jobId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs/${jobId}`)
    return response.data
  },

  // Lấy công việc liên quan
  getRelatedJobs: async (jobId, limit = 10) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs/related/${jobId}`, {
      params: { limit }
    })
    return response.data
  },

  // Lấy công việc nổi bật
  getFeaturedJobs: async (limit = 6) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs/featured`, {
      params: { limit }
    })
    return response.data
  },

  // Lấy số lượng công việc
  getJobCount: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs/count`)
    return response.data
  },

  // Lấy filter options
  getFilterOptions: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs/filters`)
    return response.data
  },

  // Lấy danh sách kỹ năng
  getSkills: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs/skills`)
    return response.data
  },

  // Lấy công việc theo công ty
  getJobsByCompany: async (companyId) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs/company/${companyId}`)
    return response.data
  },

  // Tìm kiếm công việc
  searchJobs: async (keyword) => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/jobs`, {
      params: { keyword }
    })
    return response.data
  }
}