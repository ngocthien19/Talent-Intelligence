import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const candidateApi = {
  // Lấy danh sách ứng viên
  getCandidates: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/candidates?${queryParams.toString()}`
    )
    return response.data
  },

  // Lấy chi tiết ứng viên
  getCandidateDetail: async (id) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/candidates/${id}`
    )
    return response.data
  },

  // Cập nhật trạng thái
  updateStatus: async (id, status) => {
    const response = await authorizedAxiosInstance.put(
      `${DEV_API_URL}/api/hr/candidates/${id}/status`,
      { status }
    )
    return response.data
  },

  // Xóa ứng viên
  deleteCandidate: async (id) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/hr/candidates/${id}`
    )
    return response.data
  },

  // Xóa hàng loạt ứng viên
  deleteBulk: async (ids) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/hr/candidates/bulk`,
      { data: { ids } }
    )
    return response.data
  },

  // Lấy widgets
  getWidgets: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/widgets`
    )
    return response.data
  }
}