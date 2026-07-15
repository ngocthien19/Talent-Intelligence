import { useEffect } from 'react'
import { useSelector } from 'react-redux'

const ThemeInitializer = () => {
  const { isDarkMode } = useSelector((state) => state.ui)

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return null
}

export default ThemeInitializer