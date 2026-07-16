import axios from 'axios'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL } from '~/utils/constant'

export const authApi = {
  register: async (registerData) => {
    const response = await axios.post(`${DEV_API_URL}/api/auth/register`, registerData)
    return response.data
  },

  verifyOtp: async (otpData) => {
    const response = await axios.post(`${DEV_API_URL}/api/auth/verify-otp`, otpData)
    return response.data
  },

  resendOtp: async (email) => {
    const response = await axios.post(`${DEV_API_URL}/api/auth/resend-otp`, { email })
    return response.data
  },

  login: async (loginData) => {
    const response = await axios.post(`${DEV_API_URL}/api/auth/login`, loginData, {
      withCredentials: true
    })
    return response.data
  },

  forgotPassword: async (email) => {
    const response = await axios.post(`${DEV_API_URL}/api/auth/forgot-password`, { email })
    return response.data
  },

  resetPassword: async (resetData) => {
    const response = await axios.post(`${DEV_API_URL}/api/auth/reset-password`, resetData)
    return response.data
  },

  refreshToken: async () => {
    const response = await axios.post(`${DEV_API_URL}/api/auth/refresh-token`)
    return response.data
  },

  logout: async () => {
    const response = await authorizedAxiosInstance.post(`${DEV_API_URL}/api/auth/logout`)
    return response.data
  },

  getProfile: async () => {
    const response = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/candidates/profile`)
    return response.data
  }
}