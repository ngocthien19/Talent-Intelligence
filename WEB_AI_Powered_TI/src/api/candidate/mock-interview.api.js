import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

const getLanguageHeader = () => {
  return localStorage.getItem('i18nextLng') || 'vi'
}

export const mockInterviewApi = {
  sendMessage: async (sessionId, message) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/chat`,
      { sessionId, message },
      {
        headers: {
          'Accept-Language': getLanguageHeader()
        }
      }
    )
    return response.data
  },

  createSession: async () => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/session`,
      {},
      {
        headers: {
          'Accept-Language': getLanguageHeader()
        }
      }
    )
    return response.data
  },

  getChatHistory: async (sessionId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/mock-interview/${sessionId}/history`
    )
    return response.data
  },

  getSessions: async () => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/mock-interview/sessions`
    )
    return response.data
  },

  getSessionDetail: async (sessionId) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/mock-interview/${sessionId}`
    )
    return response.data
  },

  endSession: async (sessionId) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/mock-interview/${sessionId}/end`,
      {},
      {
        headers: {
          'Accept-Language': getLanguageHeader()
        }
      }
    )
    return response.data
  },

  deleteSession: async (sessionId) => {
    const response = await authorizedAxiosInstance.delete(
      `${DEV_API_URL}/api/mock-interview/${sessionId}`
    )
    return response.data
  }
}