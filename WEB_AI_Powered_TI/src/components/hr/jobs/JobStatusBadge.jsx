import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const JobStatusBadge = ({ isActive, className = '' }) => {
  const { t } = useLanguage()

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
        isActive
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      } ${className}`}
    >
      {isActive ? (
        <FaCheckCircle size={12} />
      ) : (
        <FaTimesCircle size={12} />
      )}
      {isActive ? t('hr.job.active') || 'Đang hoạt động' : t('hr.job.inactive') || 'Tạm dừng'}
    </span>
  )
}

export default JobStatusBadge