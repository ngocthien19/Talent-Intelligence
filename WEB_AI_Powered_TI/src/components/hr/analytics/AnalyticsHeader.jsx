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

const AnalyticsHeader = ({ total }) => {
  const { t } = useLanguage()

  return (
    <motion.div variants={itemVariants}>
      <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
        {t('hr.analytics.title') || 'Phân tích ứng viên'}
      </h1>
      <p className="text-sm text-brand-text/60 dark:text-gray-400">
        {total > 0
          ? `${total} ${t('hr.analytics.candidatesWaiting') || 'ứng viên đang chờ phân tích'}`
          : t('hr.analytics.allAnalyzed') || 'Tất cả ứng viên đã được phân tích'}
      </p>
    </motion.div>
  )
}

export default AnalyticsHeader