import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const dashboardApi = {
  // Lấy dữ liệu dashboard
  getDashboard: async (params = {}) => {
    const { period = '30days', startDate, endDate } = params

    const queryParams = new URLSearchParams()
    queryParams.append('period', period)
    if (startDate) queryParams.append('startDate', startDate)
    if (endDate) queryParams.append('endDate', endDate)

    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/dashboard?${queryParams.toString()}`
    )
    return response.data
  }
}