import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaEye,
  FaEdit,
  FaCalendarAlt,
  FaUser,
  FaBriefcase,
  FaClock,
  FaTimesCircle,
  FaChevronDown,
  FaBan
} from 'react-icons/fa'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { useLanguage } from '~/hooks/useLanguage'
import InterviewStatusBadge from './InterviewStatusBadge'
import { formatDate } from '~/utils/format'

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Đã lên lịch' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'no_show', label: 'Vắng mặt' }
]

const TERMINAL_STATUSES = ['completed', 'cancelled', 'no_show']

const STATUS_FLOW = {
  'scheduled': ['confirmed', 'cancelled'],
  'confirmed': ['completed', 'cancelled', 'no_show'],
  'completed': [],
  'cancelled': [],
  'no_show': []
}

const InterviewRow = ({
  interview,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  index
}) => {
  const { t } = useLanguage()
  const [isStatusOpen, setIsStatusOpen] = useState(false)

  const interviewDate = new Date(interview.interview_date)
  const isPast = interviewDate < new Date()
  const isToday = interviewDate.toDateString() === new Date().toDateString()

  // Kiểm tra trạng thái có thể chỉnh sửa/hủy
  const isEditable = interview.status === 'scheduled' || interview.status === 'confirmed'
  const isDeletable = interview.status === 'scheduled'

  const isStatusUpdatable = !TERMINAL_STATUSES.includes(interview.status)

  // Lấy avatar URL
  const avatarUrl = interview?.avatar?.secure_url || null

  const getAvailableStatuses = (currentStatus) => {
    return STATUS_FLOW[currentStatus] || []
  }

  const availableStatuses = getAvailableStatuses(interview.status)

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        backgroundColor: 'rgba(0,0,0,0.02)',
        transition: { duration: 0.15 }
      }}
      className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors duration-150"
    >
      {/* Checkbox */}
      <td className="px-3 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all duration-200 cursor-pointer hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isDeletable}
        />
      </td>

      {/* Candidate - Căn trái */}
      <td className="px-3 py-3 text-left">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={interview.candidate_name || 'Avatar'}
              className="w-8 h-8 rounded-full object-cover border-2 border-brand-light/30 dark:border-gray-700 flex-shrink-0"
            />
          ) : null}
          <div
            className={`w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 fallback-avatar ${avatarUrl ? 'hidden' : ''}`}
          >
            {interview.candidate_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-brand-secondary dark:text-white truncate max-w-[150px]">
              {interview.candidate_name || '--'}
            </p>
            <p className="text-xs text-brand-text/40 dark:text-gray-500 truncate max-w-[150px]">
              {interview.candidate_email}
            </p>
          </div>
        </div>
      </td>

      {/* Position */}
      <td className="px-3 py-3 text-center">
        <p className="text-sm text-brand-text dark:text-gray-300 truncate max-w-[150px]">
          {interview.position_applied || '--'}
        </p>
      </td>

      {/* Date & Time */}
      <td className="px-3 py-3 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-brand-text dark:text-gray-300">
            <FaCalendarAlt size={12} className="text-brand-primary/60" />
            <span className="text-sm">{formatDate(interviewDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-brand-text/60 dark:text-gray-400 mt-0.5">
            <FaClock size={11} className="text-brand-primary/40" />
            <span className="text-xs">
              {interviewDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              {interview.duration && ` (${interview.duration}p)`}
            </span>
          </div>
          {isToday && (
            <span className="text-[10px] font-medium text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full mt-0.5 w-fit">
              {t('hr.interview.today') || 'Hôm nay'}
            </span>
          )}
          {isPast && interview.status === 'scheduled' && (
            <span className="text-[10px] font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-950/30 px-2 py-0.5 rounded-full mt-0.5 w-fit">
              {t('hr.interview.overdue') || 'Quá hạn'}
            </span>
          )}
        </div>
      </td>

      {/* Location */}
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1 text-brand-text/60 dark:text-gray-400">
          <FaBriefcase size={12} className="text-brand-primary/40" />
          <span className="text-sm truncate max-w-[120px]">{interview.location || '--'}</span>
        </div>
      </td>

      {/* Status - Có thể click để cập nhật */}
      <td className="px-3 py-3 text-center">
        <div className="relative inline-block">
          <button
            onClick={() => isStatusUpdatable && setIsStatusOpen(!isStatusOpen)}
            className={`flex items-center gap-1 transition-all duration-200 ${isStatusUpdatable ? 'hover:opacity-80 cursor-pointer group' : 'cursor-default'}`}
            disabled={!isStatusUpdatable}
          >
            <InterviewStatusBadge status={interview.status} />
            {isStatusUpdatable && (
              <span className={`text-brand-text/40 dark:text-gray-500 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}>
                <FaChevronDown size={10} />
              </span>
            )}
          </button>

          <AnimatePresence>
            {isStatusOpen && isStatusUpdatable && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10 min-w-[150px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-brand-light/50 dark:border-gray-700 overflow-hidden"
              >
                {STATUS_OPTIONS.map((opt) => {
                  const isAvailable = availableStatuses.includes(opt.value)
                  const isCurrent = interview.status === opt.value

                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        if (isAvailable) {
                          onUpdateStatus(interview.id, opt.value)
                          setIsStatusOpen(false)
                        }
                      }}
                      disabled={!isAvailable}
                      className={`w-full text-left px-3 py-2.5 text-sm transition-all duration-150 flex items-center justify-between ${
                        isCurrent
                          ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium cursor-default'
                          : isAvailable
                            ? 'hover:bg-brand-light/30 dark:hover:bg-gray-800 cursor-pointer text-brand-text dark:text-gray-300 hover:text-brand-secondary dark:hover:text-white'
                            : 'text-brand-text/30 dark:text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <span>{t(`hr.interview.statuses.${opt.value}`) || opt.label}</span>
                      {isCurrent && (
                        <span className="text-brand-primary">✓</span>
                      )}
                      {!isAvailable && !isCurrent && (
                        <FaBan size={14} className="text-brand-text/20 dark:text-gray-600 flex-shrink-0" />
                      )}
                    </button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          {/* View - Luôn hiển thị */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onView(interview)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaEye size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.interview.viewDetail') || 'Xem chi tiết'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Edit - Chỉ hiển thị khi status scheduled hoặc confirmed */}
          {isEditable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onEdit(interview)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                  >
                    <FaEdit size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t('hr.interview.edit') || 'Chỉnh sửa'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Cancel - Chỉ hiển thị khi status scheduled */}
          {isDeletable && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onDelete(interview.id)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                  >
                    <FaTimesCircle size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{t('hr.interview.cancelSchedule') || 'Hủy lịch'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>
    </motion.tr>
  )
}

export default InterviewRow