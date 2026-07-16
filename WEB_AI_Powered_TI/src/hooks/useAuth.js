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
  updateUserFields,
  forgotPassword,
  resetPassword
} from '~/redux/slices/auth.slice'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const authState = useSelector((state) => state.auth)
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    favoriteIds
  } = authState

  // ĐĂNG NHẬP
  const handleLogin = async (loginData) => {
    try {
      console.log('useAuth.login:', loginData.email)
      const result = await dispatch(login(loginData)).unwrap()
      console.log('useAuth.login result:', result)

      if (result?.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('accessToken', result.accessToken)
      }
      return result
    } catch (error) {
      console.error('useAuth.login error:', error)
      throw error
    }
  }

  // ĐĂNG KÝ
  const handleRegister = async (registerData) => {
    try {
      console.log('useAuth.register:', registerData.email)
      const result = await dispatch(register(registerData)).unwrap()
      console.log('useAuth.register result:', result)
      return result
    } catch (error) {
      console.error('useAuth.register error:', error)
      throw error
    }
  }

  // XÁC THỰC OTP
  const handleVerifyOtp = async (otpData) => {
    try {
      console.log('useAuth.verifyOtp:', otpData.email)
      const result = await dispatch(verifyOtp(otpData)).unwrap()
      console.log('useAuth.verifyOtp result:', result)
      return result
    } catch (error) {
      console.error('useAuth.verifyOtp error:', error)
      throw error
    }
  }

  // GỬI LẠI OTP
  const handleResendOtp = async (email) => {
    try {
      console.log('📤 useAuth.resendOtp:', email)
      const result = await dispatch(resendOtp(email)).unwrap()
      console.log('useAuth.resendOtp result:', result)
      return result
    } catch (error) {
      console.error('useAuth.resendOtp error:', error)
      throw error
    }
  }

  // QUÊN MẬT KHẨU
  const handleForgotPassword = async (email) => {
    try {
      console.log('useAuth.forgotPassword:', email)
      const result = await dispatch(forgotPassword(email)).unwrap()
      console.log('useAuth.forgotPassword result:', result)
      return result
    } catch (error) {
      console.error('useAuth.forgotPassword error:', error)
      throw error
    }
  }

  // ĐẶT LẠI MẬT KHẨU
  const handleResetPassword = async (resetData) => {
    try {
      console.log('📤 useAuth.resetPassword:', resetData.email)
      const result = await dispatch(resetPassword(resetData)).unwrap()
      console.log('useAuth.resetPassword result:', result)
      return result
    } catch (error) {
      console.error('useAuth.resetPassword error:', error)
      throw error
    }
  }

  // ĐĂNG XUẤT
  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      navigate('/login')
    }
  }

  // LẤY PROFILE
  const fetchProfile = async () => {
    try {
      const result = await dispatch(getProfile()).unwrap()
      console.log('useAuth.fetchProfile:', result)
      return result
    } catch (error) {
      console.error('Fetch profile error:', error)
      throw error
    }
  }

  // CẬP NHẬT PROFILE
  const updateProfile = async (data) => {
    try {
      await dispatch(updateUserFields(data))
      console.log('useAuth.updateProfile:', data)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  // XÓA LỖI
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
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    logout: handleLogout,
    fetchProfile,
    updateProfile,
    clearAuthError
  }
}