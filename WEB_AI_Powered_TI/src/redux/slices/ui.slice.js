import { createSlice } from '@reduxjs/toolkit'

const getInitialLanguage = () => {
  const saved = localStorage.getItem('language')
  return saved || 'vi'
}

const initialState = {
  language: getInitialLanguage(),
  isDarkMode: false
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    setLanguage: (state, action) => {
      state.language = action.payload
      localStorage.setItem('language', action.payload)
    }
  }
})

export const {
  toggleDarkMode,
  setDarkMode,
  setLanguage
} = uiSlice.actions

export default uiSlice.reducer