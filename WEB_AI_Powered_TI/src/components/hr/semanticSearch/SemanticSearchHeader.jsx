import { motion } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const SemanticSearchHeader = ({ total, query }) => {
  const { t } = useLanguage()

  return (
    <motion.div variants={itemVariants}>
      <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
        {t('hr.search.title') || 'Tìm kiếm ứng viên thông minh'}
      </h1>
      <p className="text-sm text-brand-text/60 dark:text-gray-400">
        {t('hr.search.subtitle') || 'Sử dụng AI để tìm kiếm ứng viên phù hợp nhất với nhu cầu của bạn'}
      </p>
      {total > 0 && query && (
        <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">
          {t('hr.search.found') || 'Tìm thấy'}{' '}
          <span className="font-bold text-brand-primary">{total}</span>{' '}
          {t('hr.search.results') || 'kết quả'}{' '}
          {t('hr.search.for') || 'cho'} "{query}"
        </p>
      )}
    </motion.div>
  )
}

export default SemanticSearchHeader