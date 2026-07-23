import { motion } from 'framer-motion'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa'
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

const CandidateDetailInfo = ({ candidate }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
    >
      <h2 className="text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
        <FaUser size={18} className="text-brand-primary" />
        {t('hr.candidate.detail.personalInfo')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
          <FaUser size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
          <div>
            <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.name') || 'Họ tên'}</p>
            <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.name || '--'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
          <FaEnvelope size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
          <div>
            <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.detail.email') || 'Email'}</p>
            <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.email || '--'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
          <FaPhone size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
          <div>
            <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.detail.phone') || 'Số điện thoại'}</p>
            <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.phone || '--'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
          <FaMapMarkerAlt size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
          <div>
            <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.detail.address') || 'Địa chỉ'}</p>
            <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.address || '--'}</p>
          </div>
        </div>

        {candidate.cover_letter && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200 md:col-span-2">
            <FaFileAlt size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.detail.coverLetter')}</p>
              <p className="text-sm text-brand-text dark:text-gray-300 whitespace-pre-wrap">{candidate.cover_letter}</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CandidateDetailInfo