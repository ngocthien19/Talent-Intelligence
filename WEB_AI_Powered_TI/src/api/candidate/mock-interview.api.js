import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const mockInterviewApi = {
  // Gửi tin nhắn trong phiên phỏng vấn (chat)
  sendMessage: async (sessionId, message) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/chat`,
      { sessionId, message }
    )
    return response.data
  },

  // Tạo phiên phỏng vấn mới
  createSession: async () => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/session`
    )
    return response.data
  },

  // Lấy lịch sử chat của phiên
  getChatHistory: async (sessionId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/mock-interview/${sessionId}/history`
    )
    return response.data
  },

  // Lấy danh sách phiên phỏng vấn
  getSessions: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/mock-interview/sessions`
    )
    return response.data
  },

  // Xóa phiên phỏng vấn
  deleteSession: async (sessionId) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/mock-interview/${sessionId}`
    )
    return response.data
  }
}