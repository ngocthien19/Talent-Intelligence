import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const notificationApi = {
  // Lấy danh sách thông báo
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const url = `${DEV_API_URL}/api/hr/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await authorizedAxiosInstance.get(url)
    return response.data
  },

  // Lấy thông báo chưa đọc
  getUnread: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/hr/notifications/unread`)
    return response.data
  },

  // Đếm thông báo chưa đọc
  countUnread: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/hr/notifications/count`)
    return response.data
  },

  // Đánh dấu đã đọc
  markAsRead: async (id) => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/hr/notifications/${id}/read`)
    return response.data
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async () => {
    const response = await authorizedAxiosInstance.put(`${DEV_API_URL}/api/hr/notifications/read-all`)
    return response.data
  },

  // Xóa thông báo
  deleteNotification: async (id) => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/hr/notifications/${id}`)
    return response.data
  },

  // Xóa tất cả thông báo
  deleteAll: async () => {
    const response = await authorizedAxiosInstance.delete(`${DEV_API_URL}/api/hr/notifications/all`)
    return response.data
  }
}

export default notificationApi