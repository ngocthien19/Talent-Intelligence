import { useLanguage } from '~/hooks/useLanguage'
import {
  FaClock,
  FaSpinner,
  FaFileAlt,
  FaStar,
  FaUserPlus,
  FaHandshake,
  FaAward,
  FaTimesCircle
} from 'react-icons/fa'

const STATUS_CONFIG = {
  pending: {
    labelKey: 'hr.candidate.pending',
    icon: FaClock,
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
  },
  analyzing: {
    labelKey: 'hr.candidate.analyzing',
    icon: FaSpinner,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
  },
  analyzed: {
    labelKey: 'hr.candidate.analyzed',
    icon: FaFileAlt,
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
  },
  shortlisted: {
    labelKey: 'hr.candidate.shortlisted',
    icon: FaStar,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  interviewed: {
    labelKey: 'hr.candidate.interviewed',
    icon: FaUserPlus,
    className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
  },
  offered: {
    labelKey: 'hr.candidate.offered',
    icon: FaHandshake,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
  },
  hired: {
    labelKey: 'hr.candidate.hired',
    icon: FaAward,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  },
  rejected: {
    labelKey: 'hr.candidate.rejected',
    icon: FaTimesCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
}

const CandidateStatusBadge = ({ status, className = '' }) => {
  const { t } = useLanguage()
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${config.className} ${className}`}>
      <Icon size={12} />
      {t(config.labelKey)}
    </span>
  )
}

export default CandidateStatusBadge