import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { FaChevronDown, FaArrowUp, FaArrowDown } from 'react-icons/fa'

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

const SORT_OPTIONS = [
  { value: 'created_at', labelKey: 'hr.candidate.date' },
  { value: 'name', labelKey: 'hr.candidate.name' },
  { value: 'overall_score', labelKey: 'hr.candidate.score' },
  { value: 'position_applied', labelKey: 'hr.candidate.position' },
  { value: 'status', labelKey: 'hr.candidate.status' }
]

const getDraftFromFilters = (filters) => ({
  status: filters.status || '',
  minScore: filters.minScore || '',
  maxScore: filters.maxScore || '',
  startDate: filters.startDate || '',
  endDate: filters.endDate || ''
})

const CandidateFilters = ({
  filters,
  onFilterChange,
  onApply,
  onReset
}) => {
  const { t } = useLanguage()

  // draft: giá trị đang được chọn trên UI, CHƯA áp dụng vào việc fetch dữ liệu
  const [draft, setDraft] = useState(() => getDraftFromFilters(filters))
  const [errors, setErrors] = useState({})

  // Khi filters "đã áp dụng" ở component cha đổi (sau khi bấm Áp dụng thành
  // công, hoặc sau khi Reset), đồng bộ lại draft để UI khớp với trạng thái
  // thật đang dùng để fetch.
  useEffect(() => {
    setDraft(getDraftFromFilters(filters))
  }, [filters.status, filters.minScore, filters.maxScore, filters.startDate, filters.endDate])

  const handleDraftChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  // Validate trên draft (KHÔNG phải trên filters đã áp dụng)
  const validateDraft = () => {
    const newErrors = {}
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    // Validate score range
    if (draft.minScore) {
      const min = parseFloat(draft.minScore)
      if (isNaN(min) || min < 0 || min > 100) {
        newErrors.minScore = 'Điểm từ phải trong khoảng 0-100'
      }
    }

    if (draft.maxScore) {
      const max = parseFloat(draft.maxScore)
      if (isNaN(max) || max < 0 || max > 100) {
        newErrors.maxScore = 'Điểm đến phải trong khoảng 0-100'
      }
    }

    if (draft.minScore && draft.maxScore) {
      const min = parseFloat(draft.minScore)
      const max = parseFloat(draft.maxScore)
      if (!isNaN(min) && !isNaN(max) && min > max) {
        newErrors.minScore = 'Điểm từ phải nhỏ hơn điểm đến'
      }
    }

    // Validate dates
    if (draft.startDate && draft.endDate) {
      const start = new Date(draft.startDate)
      const end = new Date(draft.endDate)

      if (start > end) {
        newErrors.startDate = 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc'
      }

      if (end > today) {
        newErrors.endDate = 'Ngày kết thúc không được vượt quá ngày hiện tại'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Validate ngay khi draft đổi để báo lỗi sớm cho người dùng - KHÔNG fetch gì cả
  useEffect(() => {
    validateDraft()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.minScore, draft.maxScore, draft.startDate, draft.endDate])

  const handleApply = () => {
    if (validateDraft()) {
      onApply(draft)
    }
  }

  const handleReset = () => {
    setErrors({})
    // Không tự set draft ở đây - component cha sẽ reset `filters`,
    // và effect phía trên sẽ tự đồng bộ draft theo filters mới.
    onReset()
  }

  // Get status label
  const getStatusLabel = (value) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === value)
    return option ? t(option.labelKey) : t('hr.candidate.all')
  }

  // Get sort label
  const getSortLabel = (value) => {
    const option = SORT_OPTIONS.find(opt => opt.value === value)
    return option ? t(option.labelKey) : t('hr.candidate.date')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 overflow-hidden"
    >
      <div className="p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-brand-secondary dark:text-white">
            {t('hr.candidate.filters') || 'Bộ lọc'}
          </h3>
          <button
            onClick={handleReset}
            className="text-xs text-brand-text/60 dark:text-gray-400 hover:text-brand-primary transition-colors cursor-pointer"
          >
            {t('hr.candidate.clearFilters') || 'Xóa tất cả'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {/* Status - DropdownMenu với width cố định */}
          <div className="xl:col-span-1">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
              {t('hr.candidate.status') || 'Trạng thái'}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-[180px] flex items-center justify-between px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer">
                  <span className="truncate">{getStatusLabel(draft.status)}</span>
                  <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl">
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleDraftChange('status', opt.value)}
                    className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 ${
                      draft.status === opt.value
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20'
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
          <div>
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
              {t('hr.candidate.minScore') || 'Điểm từ'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={draft.minScore || ''}
              onChange={(e) => handleDraftChange('minScore', e.target.value)}
              placeholder="0"
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                errors.minScore ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
              }`}
            />
            {errors.minScore && (
              <p className="text-xs text-red-500 mt-1">{errors.minScore}</p>
            )}
          </div>

          {/* Max Score */}
          <div>
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
              {t('hr.candidate.maxScore') || 'Điểm đến'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={draft.maxScore || ''}
              onChange={(e) => handleDraftChange('maxScore', e.target.value)}
              placeholder="100"
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                errors.maxScore ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
              }`}
            />
            {errors.maxScore && (
              <p className="text-xs text-red-500 mt-1">{errors.maxScore}</p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
              {t('hr.fromDate') || 'Từ ngày'}
            </label>
            <input
              type="date"
              value={draft.startDate || ''}
              onChange={(e) => handleDraftChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                errors.startDate ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
              }`}
            />
            {errors.startDate && (
              <p className="text-xs text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
              {t('hr.toDate') || 'Đến ngày'}
            </label>
            <input
              type="date"
              value={draft.endDate || ''}
              onChange={(e) => handleDraftChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                errors.endDate ? 'border-red-500 focus:ring-red-500' : 'border-brand-light/50 dark:border-gray-700'
              }`}
            />
            {errors.endDate && (
              <p className="text-xs text-red-500 mt-1">{errors.endDate}</p>
            )}
          </div>

          {/* Sort By - vẫn "live", không nằm trong draft/apply */}
          <div>
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
              {t('hr.candidate.sortBy') || 'Sắp xếp theo'}
            </label>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-[150px] flex-1 flex items-center justify-between px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer">
                    <span className="truncate">{getSortLabel(filters.sortBy)}</span>
                    <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl">
                  {SORT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      onClick={() => onFilterChange('sortBy', opt.value)}
                      className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 ${
                        filters.sortBy === opt.value
                          ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20'
                          : 'text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {t(opt.labelKey)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Order button với Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'DESC' ? 'ASC' : 'DESC')}
                      className="w-10 h-10 flex items-center justify-center border border-brand-light/50 dark:border-gray-700 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                    >
                      {filters.sortOrder === 'DESC' ? (
                        <FaArrowDown size={14} className="text-brand-text dark:text-gray-300" />
                      ) : (
                        <FaArrowUp size={14} className="text-brand-text dark:text-gray-300" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>{filters.sortOrder === 'DESC' ? 'Giảm dần' : 'Tăng dần'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-brand-light/50 dark:border-gray-700">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white transition-colors cursor-pointer"
          >
            {t('common.reset') || 'Đặt lại'}
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            {t('common.apply') || 'Áp dụng'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default CandidateFilters