import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const jobApi = {
  // Lấy danh sách công việc
  getJobs: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/jobs?${queryParams.toString()}`
    )
    return response.data
  },

  // Tạo công việc mới
  createJob: async (data) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/jobs`,
      data
    )
    return response.data
  },

  // Cập nhật công việc
  updateJob: async (id, data) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/hr/jobs/${id}`,
      data
    )
    return response.data
  },

  // Xóa công việc
  deleteJob: async (id) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/hr/jobs/${id}`
    )
    return response.data
  },

  // Xóa bulk
  deleteBulk: async (ids) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/jobs/bulk`,
      { ids, action: 'delete' }
    )
    return response.data
  },

  // Kích hoạt bulk
  activateBulk: async (ids) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/jobs/bulk`,
      { ids, action: 'activate' }
    )
    return response.data
  },

  // Tạm dừng bulk
  deactivateBulk: async (ids) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/jobs/bulk`,
      { ids, action: 'deactivate' }
    )
    return response.data
  },

  // Lấy danh sách category (dropdown)
  getCategories: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/categories`
    )
    return response.data
  },

  // Lấy category dropdown
  getCategoryDropdown: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/categories/dropdown`
    )
    return response.data
  },

  // Lấy chi tiết công việc (kèm candidates và stats)
  getJobDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/jobs/${id}/detail`
    )
    return response.data
  },

  // Lấy ứng viên của công việc
  getJobCandidates: async (id, params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/jobs/${id}/candidates?${queryParams.toString()}`
    )
    return response.data
  },

  // Lấy thống kê công việc
  getJobStats: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/jobs/stats`
    )
    return response.data
  },

  // Lấy danh sách ứng viên yêu thích công việc
  getFavoriteCandidates: async (jobId, params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/jobs/${jobId}/favorites/candidates?${queryParams.toString()}`
    )
    return response.data
  },

  // Lấy số lượng ứng viên yêu thích công việc
  getFavoriteCount: async (jobId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/jobs/${jobId}/favorites/count`
    )
    return response.data
  },

  // Lấy danh sách công việc được yêu thích nhiều nhất
  getTopFavoriteJobs: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/favorites/top-jobs?${queryParams.toString()}`
    )
    return response.data
  },

  // Lấy danh sách ứng viên yêu thích nhiều công việc nhất
  getTopFavoriteCandidates: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/favorites/top-candidates?${queryParams.toString()}`
    )
    return response.data
  }
}