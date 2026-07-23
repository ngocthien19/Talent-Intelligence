import { motion } from 'framer-motion'
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaMoneyBillWave, FaClock } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { formatSalary } from '~/utils/format'

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

const CandidateDetailJob = ({ candidate }) => {
  const { t } = useLanguage()

  const hasJobInfo = candidate.job_title || candidate.company_name || candidate.job_location

  if (!hasJobInfo) {
    return null
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
    >
      <h2 className="text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
        <FaBriefcase size={18} className="text-brand-primary" />
        {t('hr.candidate.jobInfo') || 'Thông tin công việc'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {candidate.job_title && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
            <FaBriefcase size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.position') || 'Vị trí'}</p>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.job_title}</p>
            </div>
          </div>
        )}

        {candidate.company_name && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
            <FaBuilding size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.company') || 'Công ty'}</p>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.company_name}</p>
            </div>
          </div>
        )}

        {candidate.job_location && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
            <FaMapMarkerAlt size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.location') || 'Địa điểm'}</p>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.job_location}</p>
            </div>
          </div>
        )}

        {candidate.salary_range && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
            <FaMoneyBillWave size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.salary') || 'Mức lương'}</p>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">{formatSalary(candidate.salary_range)}</p>
            </div>
          </div>
        )}

        {candidate.experience_level && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-brand-light/5 dark:bg-gray-800/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/30 transition-all duration-200">
            <FaClock size={16} className="text-brand-text/40 dark:text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.candidate.experience') || 'Kinh nghiệm'}</p>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">{candidate.experience_level}</p>
            </div>
          </div>
        )}
      </div>

      {/* Job description */}
      {candidate.job_description && (
        <div className="mt-4 p-4 rounded-lg bg-brand-light/5 dark:bg-gray-800/50">
          <p className="text-xs text-brand-text/40 dark:text-gray-500 mb-1">{t('hr.candidate.jobDesc') || 'Mô tả công việc'}</p>
          <p className="text-sm text-brand-text dark:text-gray-300 whitespace-pre-wrap">{candidate.job_description}</p>
        </div>
      )}
    </motion.div>
  )
}

export default CandidateDetailJob