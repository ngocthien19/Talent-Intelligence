import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLanguage } from '~/redux/slices/ui.slice'
import { useTranslation } from 'react-i18next'

const LanguageInitializer = () => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const language = useSelector((state) => state.ui.language)

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')

    if (savedLanguage) {
      if (i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage)
      }
      if (language !== savedLanguage) {
        dispatch(setLanguage(savedLanguage))
      }
    } else {
      const lang = language || 'vi'
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang)
      }
      // Lưu vào localStorage
      localStorage.setItem('language', lang)
    }
  }, [dispatch, i18n, language])

  return null
}

export default LanguageInitializer