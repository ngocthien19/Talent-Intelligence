import { motion } from 'framer-motion'
import { FaFileAlt, FaList, FaGift } from 'react-icons/fa'
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

const JobDetailInfo = ({ job }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
    >
      <h2 className="text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
        <FaFileAlt size={18} className="text-brand-primary" />
        {t('hr.job.description') || 'Mô tả công việc'}
      </h2>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-brand-text dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
          {job.description || 'Chưa có mô tả'}
        </p>
      </div>

      {job.requirements && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-brand-secondary dark:text-white mb-2 flex items-center gap-2">
            <FaList size={16} className="text-brand-primary" />
            {t('hr.job.requirements') || 'Yêu cầu'}
          </h3>
          <p className="text-sm text-brand-text dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {job.requirements}
          </p>
        </div>
      )}

      {job.benefits && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-brand-secondary dark:text-white mb-2 flex items-center gap-2">
            <FaGift size={16} className="text-brand-primary" />
            {t('hr.job.benefits') || 'Quyền lợi'}
          </h3>
          <p className="text-sm text-brand-text dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {job.benefits}
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default JobDetailInfo