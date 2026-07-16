import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { favoriteApi } from '~/api/candidate/favorite.api'

// Async thunks
export const toggleFavorite = createAsyncThunk(
  'favorite/toggle',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await favoriteApi.toggleFavorite(jobId)
      return { jobId, action: response.data.action }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Thao tác thất bại')
    }
  }
)

export const getFavorites = createAsyncThunk(
  'favorite/getFavorites',
  async (params, { rejectWithValue }) => {
    try {
      const response = await favoriteApi.getFavorites(params)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lấy danh sách thất bại')
    }
  }
)

export const checkFavorite = createAsyncThunk(
  'favorite/check',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await favoriteApi.checkFavorite(jobId)
      return { jobId, isFavorite: response.data.isFavorite }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Kiểm tra thất bại')
    }
  }
)

export const getFavoriteCount = createAsyncThunk(
  'favorite/getCount',
  async (jobId, { rejectWithValue }) => {
    try {
      const response = await favoriteApi.getFavoriteCount(jobId)
      return { jobId, count: response.data.favoriteCount }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lấy số lượng thất bại')
    }
  }
)

export const clearFavorites = createAsyncThunk(
  'favorite/clear',
  async (_, { rejectWithValue }) => {
    try {
      await favoriteApi.clearFavorites()
      return { success: true }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Xóa thất bại')
    }
  }
)

const initialState = {
  favorites: [],
  favoriteIds: [],
  isLoading: false,
  error: null,
  total: 0,
  totalPages: 0
}

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    clearFavoriteError: (state) => {
      state.error = null
    },
    resetFavorites: (state) => {
      state.favorites = []
      state.favoriteIds = []
      state.total = 0
      state.totalPages = 0
    },
    // Cập nhật trạng thái yêu thích của một job (dùng cho JobCard)
    updateFavoriteStatus: (state, action) => {
      const { jobId, isFavorite } = action.payload
      if (isFavorite) {
        if (!state.favoriteIds.includes(jobId)) {
          state.favoriteIds.push(jobId)
        }
      } else {
        state.favoriteIds = state.favoriteIds.filter(id => id !== jobId)
        // Cũng xóa khỏi danh sách favorites nếu có
        state.favorites = state.favorites.filter(fav => fav.job_id !== jobId)
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Toggle favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.isLoading = false
        const { jobId, action: actionType } = action.payload
        if (actionType === 'added') {
          if (!state.favoriteIds.includes(jobId)) {
            state.favoriteIds.push(jobId)
          }
        } else {
          state.favoriteIds = state.favoriteIds.filter(id => id !== jobId)
          state.favorites = state.favorites.filter(fav => fav.job_id !== jobId)
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Get favorites
      .addCase(getFavorites.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getFavorites.fulfilled, (state, action) => {
        state.isLoading = false
        state.favorites = action.payload.data || []
        state.favoriteIds = (action.payload.data || []).map(fav => fav.job_id)
        state.total = action.payload.pagination?.total || 0
        state.totalPages = action.payload.pagination?.totalPages || 0
      })
      .addCase(getFavorites.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Check favorite
      .addCase(checkFavorite.fulfilled, (state, action) => {
        const { jobId, isFavorite } = action.payload
        if (isFavorite && !state.favoriteIds.includes(jobId)) {
          state.favoriteIds.push(jobId)
        } else if (!isFavorite) {
          state.favoriteIds = state.favoriteIds.filter(id => id !== jobId)
        }
      })
      // Clear favorites
      .addCase(clearFavorites.fulfilled, (state) => {
        state.favorites = []
        state.favoriteIds = []
        state.total = 0
        state.totalPages = 0
      })
  }
})

export const { clearFavoriteError, resetFavorites, updateFavoriteStatus } = favoriteSlice.actions
export default favoriteSlice.reducer