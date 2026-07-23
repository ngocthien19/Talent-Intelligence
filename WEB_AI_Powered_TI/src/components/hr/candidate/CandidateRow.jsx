import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaEye,
  FaTrash,
  FaChevronDown
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CandidateStatusBadge from './CandidateStatusBadge'
import { getDaysAgo, formatCompactNumber } from '~/utils/format'

const STATUS_OPTIONS = [
  { value: 'pending', labelKey: 'hr.candidate.pending' },
  { value: 'analyzing', labelKey: 'hr.candidate.analyzing' },
  { value: 'analyzed', labelKey: 'hr.candidate.analyzed' },
  { value: 'shortlisted', labelKey: 'hr.candidate.shortlisted' },
  { value: 'interviewed', labelKey: 'hr.candidate.interviewed' },
  { value: 'offered', labelKey: 'hr.candidate.offered' },
  { value: 'hired', labelKey: 'hr.candidate.hired' },
  { value: 'rejected', labelKey: 'hr.candidate.rejected' }
]

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

const CandidateRow = ({
  candidate,
  isSelected,
  onSelect,
  onStatusUpdate,
  onDelete,
  index
}) => {
  const { t } = useLanguage()
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(t('hr.candidate.deleteConfirm') || 'Bạn có chắc chắn muốn xóa ứng viên này?')) return
    setIsDeleting(true)
    await onDelete(candidate.id)
    setIsDeleting(false)
  }

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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 shadow-sm transition-transform duration-200 hover:scale-105">
            {candidate.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-medium text-brand-secondary dark:text-white truncate max-w-[150px] transition-colors duration-200 hover:text-brand-primary">
              {candidate.name || t('hr.candidate.unknown') || 'Chưa có tên'}
            </p>
            <p className="text-xs text-brand-text/60 dark:text-gray-400 truncate max-w-[150px]">
              {candidate.email}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="text-brand-text dark:text-gray-300 truncate max-w-[120px]">
          {candidate.position_applied || candidate.job_title || t('hr.candidate.unknown') || 'Chưa xác định'}
        </p>
        {candidate.company_name && (
          <p className="text-xs text-brand-text/40 dark:text-gray-500 truncate max-w-[120px]">
            {candidate.company_name}
          </p>
        )}
      </td>
      <td className="px-3 py-3">
        {candidate.overall_score !== null && candidate.overall_score !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-bold ${getScoreColor(candidate.overall_score)}`}>
              {formatCompactNumber(candidate.overall_score)}
            </span>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-[9px] transition-colors duration-200 ${
                    i < Math.round(candidate.overall_score / 20)
                      ? 'text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ) : (
          <span className="text-xs text-brand-text/40 dark:text-gray-500">
            {t('hr.candidate.notRated') || 'Chưa đánh giá'}
          </span>
        )}
      </td>
      <td className="px-3 py-3">
        <div className="relative">
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className="flex items-center gap-1 hover:opacity-80 transition-all duration-200 cursor-pointer group"
          >
            <CandidateStatusBadge status={candidate.status} />
            <span className={`text-brand-text/40 dark:text-gray-500 transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`}>
              <FaChevronDown size={10} />
            </span>
          </button>

          <AnimatePresence>
            {isStatusOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute left-0 top-full mt-1 z-10 min-w-[160px] bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-brand-light/50 dark:border-gray-700 overflow-hidden"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onStatusUpdate(candidate.id, opt.value)
                      setIsStatusOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm hover:bg-brand-light/30 dark:hover:bg-gray-800 transition-all duration-150 cursor-pointer ${
                      candidate.status === opt.value
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                        : 'text-brand-text dark:text-gray-300 hover:text-brand-secondary dark:hover:text-white'
                    }`}
                  >
                    {t(opt.labelKey)}
                    {candidate.status === opt.value && (
                      <span className="float-right text-brand-primary">✓</span>
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="text-xs text-brand-text/60 dark:text-gray-400">
          {candidate.created_at ? getDaysAgo(candidate.created_at) : '--'}
        </p>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <Link
            to={`/hr/candidates/${candidate.id}`}
            className="p-2 rounded-lg text-brand-text/40 dark:text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200 cursor-pointer hover:scale-110"
            title={t('hr.candidate.viewDetail') || 'Xem chi tiết'}
          >
            <FaEye size={14} />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-lg text-brand-text/40 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer disabled:opacity-50 hover:scale-110"
            title={t('hr.candidate.delete') || 'Xóa'}
          >
            {isDeleting ? (
              <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaTrash size={14} />
            )}
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

export default CandidateRow