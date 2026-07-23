import {
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaAward,
  FaTimesCircle
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { formatCompactNumber } from '~/utils/format'

const iconMap = {
  Users: FaUsers,
  Clock: FaClock,
  CheckCircle: FaCheckCircle,
  Star: FaStar,
  Award: FaAward,
  XCircle: FaTimesCircle
}

const colorMap = {
  blue: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
  yellow: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  green: 'text-green-500 bg-green-50 dark:bg-green-950/20',
  purple: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
  emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
  red: 'text-red-500 bg-red-50 dark:bg-red-950/20'
}

const getTitleKey = (id) => {
  const titleMap = {
    'total': 'hr.totalCandidates',
    'pending': 'hr.candidate.pending',
    'analyzed': 'hr.candidate.analyzed',
    'shortlisted': 'hr.candidate.shortlisted',
    'hired': 'hr.candidate.hired',
    'rejected': 'hr.candidate.rejected'
  }
  return titleMap[id] || 'hr.totalCandidates'
}

// Map label key sang ngôn ngữ
const getLabelKey = (label) => {
  const labelMap = {
    'tuần này': 'hr.thisWeek',
    'cần xem xét': 'hr.needReview',
    'đã phân tích': 'hr.analyzed',
    'shortlist': 'hr.shortlisted',
    'tỷ lệ trúng tuyển': 'hr.hireRate',
    'tỷ lệ từ chối': 'hr.rejectRate'
  }
  return labelMap[label] || label
}

const CandidateStats = ({ widgets }) => {
  const { t } = useLanguage()

  if (!widgets || widgets.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 animate-pulse">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {widgets.map((widget, index) => {
        const Icon = iconMap[widget.icon] || FaUsers
        const colorClass = colorMap[widget.color] || 'text-gray-500 bg-gray-50 dark:bg-gray-800'

        // Lấy title từ ngôn ngữ
        const titleKey = getTitleKey(widget.id)
        const title = t(titleKey) || widget.title

        // Lấy label từ ngôn ngữ
        let label = widget.change?.label || ''
        if (label) {
          const labelKey = getLabelKey(label)
          const translatedLabel = t(labelKey)
          label = translatedLabel !== labelKey ? translatedLabel : label
        }

        return (
          <div
            key={widget.id || index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${colorClass}`}>
                <Icon size={16} />
              </div>
              {widget.change && widget.change.value > 0 && (
                <span className="text-xs font-medium text-emerald-500 flex items-center gap-0.5">
                  ↑ {widget.change.value}{widget.change.type === 'percentage' ? '%' : ''}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-brand-secondary dark:text-white mt-2">
              {formatCompactNumber(widget.value)}
            </h3>
            <p className="text-xs text-brand-text/60 dark:text-gray-400 truncate">
              {title}
            </p>
            {widget.change && widget.change.label && (
              <p className="text-[10px] text-brand-text/40 dark:text-gray-500 mt-0.5">
                {label}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default CandidateStats