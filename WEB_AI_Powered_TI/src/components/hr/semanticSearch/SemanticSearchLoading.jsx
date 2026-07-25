import { motion } from 'framer-motion'
import { FaSpinner } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const SemanticSearchLoading = () => {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center py-20"
    >
      <div className="flex flex-col items-center gap-4">
        <FaSpinner className="animate-spin text-brand-primary" size={40} />
        <p className="text-brand-text/60 dark:text-gray-400">
          {t('hr.search.searching') || 'Đang tìm kiếm...'}
        </p>
      </div>
    </motion.div>
  )
}

export default SemanticSearchLoading