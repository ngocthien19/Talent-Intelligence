import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

const API_URL = `${DEV_API_URL}/api/hr/calendar`

export const calendarApi = {
  createSchedule: async (data) => {
    const response = await authorizedAxiosInstance.post(
      `${API_URL}/schedules`,
      data
    )
    return response.data
  },

  getSchedules: async (params = {}) => {
    const queryParams = new URLSearchParams()
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
    const url = `${API_URL}/schedules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await authorizedAxiosInstance.get(url)
    return response.data
  },

  getScheduleById: async (id) => {
    const response = await authorizedAxiosInstance.get(
      `${API_URL}/schedules/${id}/detail`
    )
    return response.data
  },

  getSchedulesByCandidate: async (candidateId) => {
    const response = await authorizedAxiosInstance.get(
      `${API_URL}/schedules/candidate/${candidateId}`
    )
    return response.data
  },

  updateScheduleStatus: async (id, status) => {
    const response = await authorizedAxiosInstance.put(
      `${API_URL}/schedules/${id}/status`,
      { status }
    )
    return response.data
  },

  confirmSchedule: async (id) => {
    const response = await authorizedAxiosInstance.put(
      `${API_URL}/schedules/${id}/confirm`
    )
    return response.data
  },

  deleteSchedule: async (id) => {
    const response = await authorizedAxiosInstance.delete(
      `${API_URL}/schedules/${id}`
    )
    return response.data
  },

  deleteBulkSchedules: async (ids) => {
    const response = await authorizedAxiosInstance.post(
      `${API_URL}/schedules/bulk-delete`,
      { ids }
    )
    return response.data
  },

  createCalendarEvent: async (id) => {
    const response = await authorizedAxiosInstance.post(
      `${API_URL}/schedules/${id}/calendar`
    )
    return response.data
  },

  getUpcomingSchedules: async (limit = 5) => {
    const response = await authorizedAxiosInstance.get(
      `${API_URL}/schedules/upcoming?limit=${limit}`
    )
    return response.data
  },

  getTodaySchedules: async () => {
    const response = await authorizedAxiosInstance.get(
      `${API_URL}/schedules/today`
    )
    return response.data
  },

  getScheduleCount: async (candidateId) => {
    const response = await authorizedAxiosInstance.get(
      `${API_URL}/schedules/count/${candidateId}`
    )
    return response.data
  },

  getScheduleStats: async () => {
    const response = await authorizedAxiosInstance.get(
      `${API_URL}/schedules/stats`
    )
    return response.data
  }
}

export default calendarApi