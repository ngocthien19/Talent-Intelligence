import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '~/api/auth/auth.api'

// ĐĂNG NHẬP
export const login = createAsyncThunk(
  'auth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(loginData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng nhập thất bại')
    }
  }
)

// ĐĂNG KÝ
export const register = createAsyncThunk(
  'auth/register',
  async (registerData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(registerData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng ký thất bại')
    }
  }
)

// XÁC THỰC OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(otpData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xác thực OTP thất bại')
    }
  }
)

// GỬI LẠI OTP
export const resendOtp = createAsyncThunk(
  'auth/resendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.resendOtp(email)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gửi lại OTP thất bại')
    }
  }
)

// QUÊN MẬT KHẨU
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword(email)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Gửi yêu cầu thất bại')
    }
  }
)

// ĐẶT LẠI MẬT KHẨU
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(resetData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đặt lại mật khẩu thất bại')
    }
  }
)

// ĐĂNG XUẤT
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
      return { success: true }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại')
    }
  }
)

// LẤY PROFILE
export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile()
      const userData = response.data || response
      return userData
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lấy thông tin thất bại')
    }
  }
)

// REFRESH TOKEN
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.refreshToken()
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Refresh token thất bại')
    }
  }
)

// Khởi tạo favoriteIds từ localStorage
const getInitialFavorites = () => {
  try {
    const persistRoot = localStorage.getItem('persist:root')
    if (persistRoot) {
      const parsed = JSON.parse(persistRoot)
      if (parsed.auth) {
        const auth = JSON.parse(parsed.auth)
        if (auth.favoriteIds) {
          return auth.favoriteIds
        }
      }
    }
    const user = localStorage.getItem('user')
    if (user) {
      const parsed = JSON.parse(user)
      return parsed.favoriteIds || []
    }
  } catch (e) {
    return []
  }
  return []
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  favoriteIds: getInitialFavorites()
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      if (action.payload?.favoriteIds) {
        state.favoriteIds = action.payload.favoriteIds
      }
    },
    clearUser: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.favoriteIds = []
    },
    setFavorites: (state, action) => {
      state.favoriteIds = action.payload
    },
    addToFavorites: (state, action) => {
      if (!state.favoriteIds.includes(action.payload)) {
        state.favoriteIds.push(action.payload)
      }
    },
    removeFromFavorites: (state, action) => {
      state.favoriteIds = state.favoriteIds.filter(id => id !== action.payload)
    },
    updateUserFields: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload
      }
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload
    },
    syncFavorites: (state, action) => {
      state.favoriteIds = action.payload || []
      if (state.user) {
        state.user.favoriteIds = action.payload || []
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken

        if (action.payload.user?.roleName) {
          state.user.roleName = action.payload.user.roleName
        }
        if (action.payload.user?.companyId) {
          state.user.companyId = action.payload.user.companyId
        }

        if (action.payload.user?.favoriteIds) {
          state.favoriteIds = action.payload.user.favoriteIds
        } else {
          state.favoriteIds = []
        }

        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
        state.error = action.payload
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false
        state.error = null
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.favoriteIds = []
        state.error = null
      })
      .addCase(logout.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.favoriteIds = []
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
        if (action.payload?.favoriteIds) {
          state.favoriteIds = action.payload.favoriteIds
        }
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(getProfile.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.favoriteIds = []
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false
        state.user = null
        state.accessToken = null
      })
  }
})

export const {
  clearError,
  setUser,
  clearUser,
  setFavorites,
  addToFavorites,
  removeFromFavorites,
  updateUserFields,
  updateAccessToken,
  syncFavorites
} = authSlice.actions

export default authSlice.reducer