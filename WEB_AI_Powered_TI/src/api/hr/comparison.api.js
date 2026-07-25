import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const comparisonApi = {
  compareCandidates: async (candidateIds) => {
    const response = await authorizedAxiosInstance.post(
      `${DEV_API_URL}/api/hr/compare`,
      { candidateIds }
    )
    return response.data
  },
  compareTwo: async (id1, id2) => {
    const response = await authorizedAxiosInstance.get(
      `${DEV_API_URL}/api/hr/compare/${id1}/${id2}`
    )
    return response.data
  }
}

export default comparisonApi