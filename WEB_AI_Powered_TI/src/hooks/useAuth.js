import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  login,
  logout,
  getProfile,
  register,
  verifyOtp,
  resendOtp,
  clearError,
  updateUserFields
} from '~/redux/slices/auth.slice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    favoriteIds
  } = useSelector((state) => state.auth)

  const handleLogin = async (loginData) => {
    try {
      const result = await dispatch(login(loginData)).unwrap()
      // Token đã ở cookie, chỉ lưu user vào Redux
      return result
    } catch (error) {
      throw error
    }
  }

  const handleRegister = async (registerData) => {
    try {
      const result = await dispatch(register(registerData)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  const handleVerifyOtp = async (otpData) => {
    try {
      const result = await dispatch(verifyOtp(otpData)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  const handleResendOtp = async (email) => {
    try {
      const result = await dispatch(resendOtp(email)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Vẫn navigate dù có lỗi
      navigate('/login')
    }
  }

  const fetchProfile = async () => {
    try {
      await dispatch(getProfile()).unwrap()
    } catch (error) {
      console.error('Fetch profile error:', error)
    }
  }

  const updateProfile = async (data) => {
    try {
      await dispatch(updateUserFields(data))
    } catch (error) {
      console.error('Update profile error:', error)
    }
  }

  const clearAuthError = () => {
    dispatch(clearError())
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    favoriteIds,
    login: handleLogin,
    register: handleRegister,
    verifyOtp: handleVerifyOtp,
    resendOtp: handleResendOtp,
    logout: handleLogout,
    fetchProfile,
    updateProfile,
    clearAuthError
  }
}