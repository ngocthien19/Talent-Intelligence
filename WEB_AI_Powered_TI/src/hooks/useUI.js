import { useSelector, useDispatch } from 'react-redux'
import {
  toggleDarkMode,
  setDarkMode,
  setLanguage
} from '~/redux/slices/ui.slice'

export const useUI = () => {
  const dispatch = useDispatch()
  const { language, isDarkMode } = useSelector((state) => state.ui)

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode())
  }

  const handleSetDarkMode = (value) => {
    dispatch(setDarkMode(value))
  }

  const handleSetLanguage = (lang) => {
    dispatch(setLanguage(lang))
  }

  return {
    language,
    isDarkMode,
    toggleDarkMode: handleToggleDarkMode,
    setDarkMode: handleSetDarkMode,
    setLanguage: handleSetLanguage
  }
}