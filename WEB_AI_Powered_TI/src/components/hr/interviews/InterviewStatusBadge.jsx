import { motion } from 'framer-motion'
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck,
  FaUserSlash,
  FaSpinner
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const STATUS_CONFIG = {
  scheduled: {
    icon: FaClock,
    bg: 'bg-blue-100 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800'
  },
  confirmed: {
    icon: FaCheckCircle,
    bg: 'bg-emerald-100 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800'
  },
  completed: {
    icon: FaCalendarCheck,
    bg: 'bg-green-100 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800'
  },
  cancelled: {
    icon: FaTimesCircle,
    bg: 'bg-red-100 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800'
  },
  no_show: {
    icon: FaUserSlash,
    bg: 'bg-orange-100 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-800'
  }
}

const STATUS_LABELS = {
  scheduled: 'hr.interview.statuses.scheduled',
  confirmed: 'hr.interview.statuses.confirmed',
  completed: 'hr.interview.statuses.completed',
  cancelled: 'hr.interview.statuses.cancelled',
  no_show: 'hr.interview.statuses.noShow'
}

const InterviewStatusBadge = ({ status, className = '' }) => {
  const { t } = useLanguage()
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled
  const Icon = config.icon

  const label = t(STATUS_LABELS[status]) || status

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <Icon size={12} />
      {label}
    </motion.span>
  )
}

export default InterviewStatusBadge