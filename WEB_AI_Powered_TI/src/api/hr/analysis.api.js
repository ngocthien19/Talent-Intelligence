import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

const API_URL = `${DEV_API_URL}/api/hr/candidates`

export const analysisApi = {
  // Kích hoạt phân tích cơ bản (bất đồng bộ, chạy qua queue, trả về jobId)
  analyzeCandidate: async (id) => {
    const response = await authorizedAxiosInstance.post(`${API_URL}/${id}/analyze`)
    return response.data
  },

  // Poll trạng thái phân tích (dùng vì analyze chạy qua queue, không có kết quả ngay)
  getAnalysisStatus: async (id) => {
    const response = await authorizedAxiosInstance.get(`${API_URL}/${id}/status`)
    return response.data
  },

  // Lấy kết quả phân tích đã hoàn tất
  getAnalysisResult: async (id) => {
    const response = await authorizedAxiosInstance.get(`${API_URL}/${id}/analysis`)
    return response.data
  }
}

export default analysisApi