import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const mockInterviewApi = {
  // Bắt đầu phiên phỏng vấn
  startSession: async (data) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/start`,
      data
    )
    return response.data
  },

  // Trả lời câu hỏi
  answerQuestion: async (data) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/answer`,
      data
    )
    return response.data
  },

  // Kết thúc phiên phỏng vấn
  endSession: async (sessionId) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/${sessionId}/end`
    )
    return response.data
  },

  // Lấy lịch sử phỏng vấn
  getHistory: async (params = {}) => {
    const { limit = 10 } = params
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/mock-interview/history`,
      { params: { limit } }
    )
    return response.data
  },

  // Lấy chi tiết phiên phỏng vấn
  getSessionDetail: async (sessionId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/mock-interview/${sessionId}`
    )
    return response.data
  }
}