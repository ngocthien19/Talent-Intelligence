import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const LanguageInitializer = () => {
  const { i18n } = useTranslation()
  const { language } = useSelector((state) => state.ui)

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  return null
}

export default LanguageInitializer