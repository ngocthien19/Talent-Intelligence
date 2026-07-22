import { FaUsers, FaFileAlt, FaUserPlus, FaCheckCircle } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { formatCompactNumber } from '~/utils/format'

const STATS_CONFIG = [
  { key: 'total', labelKey: 'hr.totalCandidates', icon: FaUsers, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { key: 'new', labelKey: 'hr.newCandidates', icon: FaFileAlt, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
  { key: 'analyzed', labelKey: 'hr.analyzed', icon: FaUserPlus, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { key: 'hired', labelKey: 'hr.hired', icon: FaCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' }
]

const StatsGrid = ({ summary }) => {
  const { t } = useLanguage()

  const stats = STATS_CONFIG.map((stat) => ({
    ...stat,
    label: t(stat.labelKey),
    value: formatCompactNumber(summary?.[stat.key] || 0)
  }))

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className={`p-2.5 rounded-xl w-fit ${stat.bg}`}>
            <stat.icon size={20} className={stat.color} />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-brand-secondary dark:text-white mt-2">{stat.value}</h3>
          <p className="text-xs md:text-sm text-brand-text/60 dark:text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

export default StatsGrid