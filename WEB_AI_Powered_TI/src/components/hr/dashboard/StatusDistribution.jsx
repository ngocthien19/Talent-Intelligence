import { Link } from 'react-router-dom'
import { FaChartLine } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const STATUS_COLORS = {
  pending: 'bg-yellow-500',
  reviewing: 'bg-blue-500',
  shortlisted: 'bg-emerald-500',
  interviewed: 'bg-purple-500',
  offered: 'bg-orange-500',
  hired: 'bg-green-500',
  rejected: 'bg-red-500',
  analyzed: 'bg-indigo-500'
}

const StatusDistribution = ({ statusCounts, className = '' }) => {
  const { t } = useLanguage()

  const statusData = Object.entries(statusCounts || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      label: t(`hr.status.${status}`) || status,
      value: count,
      color: STATUS_COLORS[status] || 'bg-gray-500'
    }))

  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0)

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-200 ${className}`}
    >
      <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
        <FaChartLine size={18} className="text-brand-primary" />
        {t('hr.statusDistribution')}
      </h2>
      {statusData.length > 0 ? (
        <div className="space-y-3">
          {statusData.map((item, index) => (
            <div key={index} className="group">
              <div className="flex items-center justify-between text-xs md:text-sm mb-1">
                <span className="text-brand-text dark:text-gray-300">{item.label}</span>
                <span className="font-medium text-brand-secondary dark:text-white">
                  {item.value} ({totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500 group-hover:opacity-80`}
                  style={{ width: totalStatus > 0 ? `${(item.value / totalStatus) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-brand-text/60 dark:text-gray-400">
          <p className="text-sm">{t('common.noData')}</p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-brand-light/50 dark:border-gray-700/50 flex items-center justify-between text-xs md:text-sm text-brand-text/60 dark:text-gray-400">
        <span>{t('hr.totalCandidates')}: {totalStatus}</span>
        <Link
          to="/hr/candidates"
          className="text-brand-primary hover:underline transition-all duration-200 cursor-pointer hover:scale-105 inline-flex items-center gap-1"
        >
          {t('hr.viewAll')} →
        </Link>
      </div>
    </div>
  )
}

export default StatusDistribution