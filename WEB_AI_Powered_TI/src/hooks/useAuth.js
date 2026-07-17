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
  resetPassword,
  setFavorites,
  addToFavorites,
  removeFromFavorites,
  syncFavorites
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
    favoriteIds = []
  } = authState

  // ĐĂNG NHẬP
  const handleLogin = async (loginData) => {
    try {
      const result = await dispatch(login(loginData)).unwrap()
      if (result?.user) {
        localStorage.setItem('user', JSON.stringify(result.user))
        localStorage.setItem('accessToken', result.accessToken)
      }
      return result
    } catch (error) {
      throw error
    }
  }

  // ĐĂNG KÝ
  const handleRegister = async (registerData) => {
    try {
      const result = await dispatch(register(registerData)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  // XÁC THỰC OTP
  const handleVerifyOtp = async (otpData) => {
    try {
      const result = await dispatch(verifyOtp(otpData)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  // GỬI LẠI OTP
  const handleResendOtp = async (email) => {
    try {
      const result = await dispatch(resendOtp(email)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  // QUÊN MẬT KHẨU
  const handleForgotPassword = async (email) => {
    try {
      const result = await dispatch(forgotPassword(email)).unwrap()
      return result
    } catch (error) {
      throw error
    }
  }

  // ĐẶT LẠI MẬT KHẨU
  const handleResetPassword = async (resetData) => {
    try {
      const result = await dispatch(resetPassword(resetData)).unwrap()
      return result
    } catch (error) {
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
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      navigate('/login')
    }
  }

  // LẤY PROFILE
  const fetchProfile = async () => {
    try {
      const result = await dispatch(getProfile()).unwrap()
      if (result) {
        localStorage.setItem('user', JSON.stringify(result))
      }
      return result
    } catch (error) {
      throw error
    }
  }

  // CẬP NHẬT PROFILE
  const updateProfile = async (data) => {
    try {
      await dispatch(updateUserFields(data))
    } catch (error) {
      throw error
    }
  }

  const setFavoritesList = (ids) => {
    dispatch(setFavorites(ids || []))
  }

  const syncFavoriteIds = (ids) => {
    dispatch(syncFavorites(ids || []))
  }

  const addFavorite = (jobId) => {
    const newFavorites = [...favoriteIds, jobId]
    dispatch(addToFavorites(jobId))
    dispatch(syncFavorites(newFavorites))
    if (user) {
      const updatedUser = { ...user, favoriteIds: newFavorites }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const removeFavorite = (jobId) => {
    const newFavorites = favoriteIds.filter(id => id !== jobId)
    dispatch(removeFromFavorites(jobId))
    dispatch(syncFavorites(newFavorites))
    if (user) {
      const updatedUser = { ...user, favoriteIds: newFavorites }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const setFavoritesFromApi = (ids) => {
    dispatch(syncFavorites(ids || []))
    if (user) {
      const updatedUser = { ...user, favoriteIds: ids || [] }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const isFavorite = (jobId) => {
    if (!favoriteIds) return false
    return favoriteIds.includes(jobId)
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
    favoriteIds: favoriteIds || [],
    login: handleLogin,
    register: handleRegister,
    verifyOtp: handleVerifyOtp,
    resendOtp: handleResendOtp,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    logout: handleLogout,
    fetchProfile,
    updateProfile,
    clearAuthError,
    setFavoritesList,
    addFavorite,
    removeFavorite,
    isFavorite,
    syncFavoriteIds, // Thêm hàm mới
    setFavoritesFromApi // Thêm hàm mới
  }

}