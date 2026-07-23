import { motion } from 'framer-motion'
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarCheck,
  FaUserSlash,
  FaCalendarAlt
} from 'react-icons/fa'
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

const InterviewStats = ({ stats }) => {
  const { t } = useLanguage()

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 animate-pulse"
          >
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      label: t('hr.interview.scheduled') || 'Đã lên lịch',
      value: stats.scheduled || 0,
      icon: FaClock,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      label: t('hr.interview.confirmed') || 'Đã xác nhận',
      value: stats.confirmed || 0,
      icon: FaCheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      label: t('hr.interview.completed') || 'Đã hoàn thành',
      value: stats.completed || 0,
      icon: FaCalendarCheck,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950/20'
    },
    {
      label: t('hr.interview.cancelled') || 'Đã hủy',
      value: stats.cancelled || 0,
      icon: FaTimesCircle,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950/20'
    },
    {
      label: t('hr.interview.noShow') || 'Vắng mặt',
      value: stats.no_show || 0,
      icon: FaUserSlash,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/20'
    },
    {
      label: t('hr.interview.total') || 'Tổng cộng',
      value: stats.total || 0,
      icon: FaCalendarAlt,
      color: 'text-brand-primary',
      bg: 'bg-brand-light/20 dark:bg-brand-primary/10'
    }
  ]

  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {statItems.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`p-2 rounded-xl w-fit ${stat.bg}`}>
              <Icon size={16} className={stat.color} />
            </div>
            <h3 className="text-xl font-bold text-brand-secondary dark:text-white mt-2">
              {stat.value}
            </h3>
            <p className="text-xs text-brand-text/60 dark:text-gray-400">{stat.label}</p>
          </div>
        )
      })}
    </motion.div>
  )
}

export default InterviewStats