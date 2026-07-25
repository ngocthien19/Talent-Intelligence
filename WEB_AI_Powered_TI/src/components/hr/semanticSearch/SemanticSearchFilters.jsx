import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { FaChevronDown, FaFilter } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const STATUS_OPTIONS = [
  { value: '', labelKey: 'hr.candidate.all' },
  { value: 'pending', labelKey: 'hr.candidate.pending' },
  { value: 'analyzing', labelKey: 'hr.candidate.analyzing' },
  { value: 'analyzed', labelKey: 'hr.candidate.analyzed' },
  { value: 'shortlisted', labelKey: 'hr.candidate.shortlisted' },
  { value: 'interviewed', labelKey: 'hr.candidate.interviewed' },
  { value: 'offered', labelKey: 'hr.candidate.offered' },
  { value: 'hired', labelKey: 'hr.candidate.hired' },
  { value: 'rejected', labelKey: 'hr.candidate.rejected' }
]

const getDraftFromFilters = (filters) => ({
  status: filters.status || '',
  minScore: filters.minScore || '',
  maxScore: filters.maxScore || '',
  startDate: filters.startDate || '',
  endDate: filters.endDate || ''
})

const SemanticSearchFilters = ({ filters, onApply, onReset }) => {
  const { t } = useLanguage()

  const [draft, setDraft] = useState(() => getDraftFromFilters(filters))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setDraft(getDraftFromFilters(filters))
  }, [filters.status, filters.minScore, filters.maxScore, filters.startDate, filters.endDate])

  const handleDraftChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }))
    // Xóa lỗi khi người dùng thay đổi
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const validateDraft = () => {
    const newErrors = {}
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Validate minScore
    if (draft.minScore) {
      const min = parseFloat(draft.minScore)
      if (isNaN(min) || min < 0 || min > 100) {
        newErrors.minScore = t('hr.search.validation.minScoreInvalid') || 'Điểm từ phải trong khoảng 0-100'
      }
    }

    // Validate maxScore
    if (draft.maxScore) {
      const max = parseFloat(draft.maxScore)
      if (isNaN(max) || max < 0 || max > 100) {
        newErrors.maxScore = t('hr.search.validation.maxScoreInvalid') || 'Điểm đến phải trong khoảng 0-100'
      }
    }

    // Validate minScore < maxScore
    if (draft.minScore && draft.maxScore) {
      const min = parseFloat(draft.minScore)
      const max = parseFloat(draft.maxScore)
      if (!isNaN(min) && !isNaN(max) && min > max) {
        newErrors.minScore = t('hr.search.validation.minScoreGreaterThanMax') || 'Điểm từ phải nhỏ hơn điểm đến'
      }
    }

    // Validate date range
    if (draft.startDate && draft.endDate) {
      const start = new Date(draft.startDate)
      const end = new Date(draft.endDate)

      if (start > end) {
        newErrors.startDate = t('hr.search.validation.startDateAfterEnd') || 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
      }

      if (end > today) {
        newErrors.endDate = t('hr.search.validation.endDateFuture') || 'Ngày kết thúc không được vượt quá ngày hiện tại'
      }
    }

    // Validate only startDate
    if (draft.startDate && !draft.endDate) {
      const start = new Date(draft.startDate)
      if (start > today) {
        newErrors.startDate = t('hr.search.validation.startDateFuture') || 'Ngày bắt đầu không được vượt quá ngày hiện tại'
      }
    }

    // Validate only endDate
    if (!draft.startDate && draft.endDate) {
      const end = new Date(draft.endDate)
      if (end > today) {
        newErrors.endDate = t('hr.search.validation.endDateFuture') || 'Ngày kết thúc không được vượt quá ngày hiện tại'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleApply = () => {
    if (validateDraft()) {
      onApply(draft)
    }
  }

  const handleReset = () => {
    setErrors({})
    onReset()
  }

  const getStatusLabel = (value) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === value)
    return option ? t(option.labelKey) : t('hr.candidate.all') || 'Tất cả'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 overflow-hidden"
    >
      <div className="p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-brand-secondary dark:text-white flex items-center gap-2">
            <FaFilter size={14} className="text-brand-primary" />
            {t('hr.search.filters') || 'Bộ lọc'}
          </h3>
          <button
            onClick={handleReset}
            className="text-xs font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-primary transition-colors cursor-pointer"
          >
            {t('hr.candidate.clearFilters') || 'Xóa tất cả'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Status */}
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.candidate.status') || 'Trạng thái'}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-[42px] flex items-center justify-between px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer shadow-sm">
                  <span className="truncate flex-1 text-left">{getStatusLabel(draft.status)}</span>
                  <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl z-50">
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleDraftChange('status', opt.value)}
                    className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      draft.status === opt.value
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                        : 'text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {t(opt.labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Min Score */}
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.candidate.minScore') || 'Điểm từ'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={draft.minScore || ''}
              onChange={(e) => handleDraftChange('minScore', e.target.value)}
              placeholder="0"
              className={`w-full h-[42px] px-3.5 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 shadow-sm ${
                errors.minScore ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
              }`}
            />
            {errors.minScore && (
              <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.minScore}</p>
            )}
          </div>

          {/* Max Score */}
          <div className="flex flex-col min-w-0">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.candidate.maxScore') || 'Điểm đến'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={draft.maxScore || ''}
              onChange={(e) => handleDraftChange('maxScore', e.target.value)}
              placeholder="100"
              className={`w-full h-[42px] px-3.5 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 shadow-sm ${
                errors.maxScore ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
              }`}
            />
            {errors.maxScore && (
              <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.maxScore}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.search.dateRange') || 'Khoảng ngày'}
            </label>
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="date"
                    value={draft.startDate || ''}
                    onChange={(e) => handleDraftChange('startDate', e.target.value)}
                    className={`w-full h-[42px] px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 shadow-sm ${
                      errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
                    }`}
                    placeholder={t('hr.fromDate') || 'Từ ngày'}
                  />
                  {errors.startDate && (
                    <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.startDate}</p>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={draft.endDate || ''}
                    onChange={(e) => handleDraftChange('endDate', e.target.value)}
                    className={`w-full h-[42px] px-2 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 shadow-sm ${
                      errors.endDate ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
                    }`}
                    placeholder={t('hr.toDate') || 'Đến ngày'}
                  />
                  {errors.endDate && (
                    <p className="text-[11px] text-red-500 mt-1 leading-tight">{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-brand-light/50 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-5 py-2 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            {t('common.reset') || 'Đặt lại'}
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
          >
            {t('common.apply') || 'Áp dụng'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default SemanticSearchFilters