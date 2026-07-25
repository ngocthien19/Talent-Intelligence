import { FaFolder, FaCheckCircle, FaTimesCircle, FaCalendarDay, FaCalendarWeek } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { formatCompactNumber } from '~/utils/format'

const CategoryStats = ({ stats }) => {
  const { t } = useLanguage()

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  const statItems = [
    {
      label: t('hr.category.total') || 'Tổng',
      value: stats.total || 0,
      icon: FaFolder,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      label: t('hr.category.active') || 'Đang hoạt động',
      value: stats.active || 0,
      icon: FaCheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      label: t('hr.category.inactive') || 'Tạm dừng',
      value: stats.inactive || 0,
      icon: FaTimesCircle,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-950/20'
    },
    {
      label: t('hr.category.createdToday') || 'Hôm nay',
      value: stats.created_today || 0,
      icon: FaCalendarDay,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      label: t('hr.category.createdThisWeek') || 'Tuần này',
      value: stats.created_this_week || 0,
      icon: FaCalendarWeek,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
      {statItems.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-brand-secondary dark:text-white">
                  {formatCompactNumber(stat.value)}
                </p>
                <p className="text-xs text-brand-text/60 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CategoryStats