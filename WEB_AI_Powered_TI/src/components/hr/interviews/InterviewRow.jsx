import { motion } from 'framer-motion'
import { FaEye, FaEdit, FaTrash, FaCalendarAlt, FaUser, FaBriefcase, FaClock } from 'react-icons/fa'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { useLanguage } from '~/hooks/useLanguage'
import InterviewStatusBadge from './InterviewStatusBadge'
import { formatDate } from '~/utils/format'

const InterviewRow = ({
  interview,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onConfirm,
  index
}) => {
  const { t } = useLanguage()

  const interviewDate = new Date(interview.interview_date)
  const isPast = interviewDate < new Date()
  const isToday = interviewDate.toDateString() === new Date().toDateString()

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
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all duration-200 cursor-pointer hover:scale-110"
        />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
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
      <td className="px-3 py-3">
        <p className="text-sm text-brand-text dark:text-gray-300 truncate max-w-[150px]">
          {interview.position_applied || '--'}
        </p>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col">
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
      <td className="px-3 py-3">
        <div className="flex items-center gap-1 text-brand-text/60 dark:text-gray-400">
          <FaBriefcase size={12} className="text-brand-primary/40" />
          <span className="text-sm truncate max-w-[120px]">{interview.position_applied || '--'}</span>
        </div>
      </td>
      <td className="px-3 py-3">
        <InterviewStatusBadge status={interview.status} />
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* View */}
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

          {/* Edit */}
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

          {/* Delete */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onDelete(interview.id)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaTrash size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.interview.delete') || 'Xóa'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </motion.tr>
  )
}

export default InterviewRow