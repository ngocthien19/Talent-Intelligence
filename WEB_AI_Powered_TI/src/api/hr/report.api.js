import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

const API_URL = `${DEV_API_URL}/api/hr/reports`

export const reportApi = {
  sendReport: async (id) => {
    const response = await authorizedAxiosInstance.post(`${API_URL}/${id}/send-report`)
    return response.data
  },

  checkSent: async (id) => {
    const response = await authorizedAxiosInstance.get(`${API_URL}/${id}/report-status`)
    return response.data
  }
}

export default reportApi