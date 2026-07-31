import { useEffect } from 'react'
import { useLanguage } from './useLanguage'

const usePageTitle = (titleKey, defaultTitle = '', dynamicValue = '') => {
  const { t } = useLanguage()

  useEffect(() => {
    const siteName = 'JobMind'

    let pageTitle = ''

    // Nếu có titleKey thì dịch
    if (titleKey) {
      pageTitle = t(titleKey) || defaultTitle
    } else {
      pageTitle = defaultTitle
    }

    if (dynamicValue && pageTitle.includes('{value}')) {
      pageTitle = pageTitle.replace(/\{value\}/g, dynamicValue)
    } else if (dynamicValue && pageTitle) {
      pageTitle = `${pageTitle}: ${dynamicValue}`
    }

    // Set title
    if (pageTitle) {
      document.title = `${pageTitle} | ${siteName}`
    } else {
      document.title = siteName
    }

    // Cleanup khi unmount
    return () => {
      document.title = siteName
    }
  }, [titleKey, defaultTitle, dynamicValue, t])
}

export default usePageTitle