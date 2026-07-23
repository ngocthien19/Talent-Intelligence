import { motion } from 'framer-motion'
import {
  FaClock,
  FaFileAlt,
  FaStar,
  FaUserPlus,
  FaHandshake,
  FaAward,
  FaTimesCircle,
  FaCheckCircle
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { formatDate } from '~/utils/format'

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

const STATUS_COLORS = {
  pending: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  analyzing: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
  analyzed: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20',
  shortlisted: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
  interviewed: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
  offered: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20',
  hired: 'text-green-500 bg-green-50 dark:bg-green-950/20',
  rejected: 'text-red-500 bg-red-50 dark:bg-red-950/20'
}
const CandidateDetailTimeline = ({ candidate }) => {
  const { t } = useLanguage()

  // Tạo timeline từ status history
  const statusHistory = [
    { status: 'pending', label: t('hr.candidate.status.pending') || 'Đang chờ', icon: FaClock },
    { status: 'analyzing', label: t('hr.candidate.status.analyzing') || 'Đang phân tích', icon: FaFileAlt },
    { status: 'analyzed', label: t('hr.candidate.status.analyzed') || 'Đã phân tích', icon: FaFileAlt },
    { status: 'shortlisted', label: t('hr.candidate.status.shortlisted') || 'Đã lọc', icon: FaStar },
    { status: 'interviewed', label: t('hr.candidate.status.interviewed') || 'Đã phỏng vấn', icon: FaUserPlus },
    { status: 'offered', label: t('hr.candidate.status.offered') || 'Đã offer', icon: FaHandshake },
    { status: 'hired', label: t('hr.candidate.status.hired') || 'Đã nhận', icon: FaAward },
    { status: 'rejected', label: t('hr.candidate.status.rejected') || 'Từ chối', icon: FaTimesCircle }
  ]

  // Tìm vị trí hiện tại
  const currentIndex = statusHistory.findIndex(s => s.status === candidate.status)
  const currentStatus = statusHistory[currentIndex] || statusHistory[0]

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300 sticky top-6"
    >
      <h2 className="text-lg font-bold text-brand-secondary dark:text-white mb-6 flex items-center gap-2">
        <FaClock size={18} className="text-brand-primary" />
        {t('hr.candidate.timeline') || 'Trạng thái ứng tuyển'}
      </h2>

      {/* Current status */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-brand-light/10 dark:bg-gray-800/50 mb-6">
        <div className={`p-3 rounded-xl ${STATUS_COLORS[candidate.status] || 'bg-gray-100 dark:bg-gray-800'}`}>
          {currentStatus.icon && <currentStatus.icon size={20} />}
        </div>
        <div>
          <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.candidate.currentStatus') || 'Trạng thái hiện tại'}</p>
          <p className="text-lg font-bold text-brand-secondary dark:text-white">
            {t(`hr.candidate.status.${candidate.status}`) || candidate.status}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-6">
          {statusHistory.map((item, index) => {
            const Icon = item.icon
            const isActive = index <= currentIndex
            const isCurrent = index === currentIndex
            const color = isActive ? STATUS_COLORS[item.status] : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600'

            return (
              <div key={item.status} className="flex items-start gap-4 relative">
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 p-2 rounded-full ${color} transition-all duration-300 ${isCurrent ? 'ring-4 ring-brand-primary/30 dark:ring-brand-primary/40 scale-110' : ''}`}>
                  <Icon size={14} className={isActive ? '' : 'opacity-50'} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${isActive ? 'text-brand-secondary dark:text-white' : 'text-brand-text/40 dark:text-gray-500'}`}>
                      {t(`hr.candidate.status.${item.status}`) || item.label}
                    </p>
                    {isCurrent && (
                      <span className="text-xs font-medium text-brand-primary flex items-center gap-1">
                        <FaCheckCircle size={12} />
                        {t('hr.candidate.current') || 'Hiện tại'}
                      </span>
                    )}
                  </div>
                  {isCurrent && candidate.updated_at && (
                    <p className="text-xs text-brand-text/40 dark:text-gray-500 mt-0.5">
                      {formatDate(new Date(candidate.updated_at))}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Application date */}
      <div className="mt-6 pt-4 border-t border-brand-light/50 dark:border-gray-700/50">
        <p className="text-xs text-brand-text/40 dark:text-gray-500">
          {t('hr.candidate.appliedOn') || 'Ngày ứng tuyển'}: {candidate.created_at ? formatDate(new Date(candidate.created_at)) : '--'}
        </p>
      </div>
    </motion.div>
  )
}

export default CandidateDetailTimeline