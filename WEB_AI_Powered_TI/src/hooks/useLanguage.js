import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { setLanguage } from '~/redux/slices/ui.slice'

export const useLanguage = () => {
  const { i18n, t } = useTranslation()
  const dispatch = useDispatch()
  const language = useSelector((state) => state.ui.language)

  const changeLanguage = (lng) => {
    // Cập nhật i18n
    i18n.changeLanguage(lng)

    // Lưu vào localStorage
    localStorage.setItem('language', lng)

    // Cập nhật Redux
    dispatch(setLanguage(lng))
  }

  const getCurrentLanguage = () => {
    return language || i18n.language || 'vi'
  }

  return {
    language: getCurrentLanguage(),
    changeLanguage,
    t
  }
}