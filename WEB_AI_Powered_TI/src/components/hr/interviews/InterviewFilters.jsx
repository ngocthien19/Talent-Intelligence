import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { FaChevronDown } from 'react-icons/fa'

const STATUS_OPTIONS = [
  { value: '', labelKey: 'hr.interview.allStatus' },
  { value: 'scheduled', labelKey: 'hr.interview.statuses.scheduled' },
  { value: 'confirmed', labelKey: 'hr.interview.statuses.confirmed' },
  { value: 'completed', labelKey: 'hr.interview.statuses.completed' },
  { value: 'cancelled', labelKey: 'hr.interview.statuses.cancelled' },
  { value: 'no_show', labelKey: 'hr.interview.statuses.noShow' }
]

const getDraftFromFilters = (filters) => ({
  status: filters.status || '',
  keyword: filters.keyword || '',
  startDate: filters.startDate || '',
  endDate: filters.endDate || ''
})

const InterviewFilters = ({
  filters,
  onApply,
  onReset,
  onSearch
}) => {
  const { t } = useLanguage()
  const [draft, setDraft] = useState(() => getDraftFromFilters(filters))

  useEffect(() => {
    setDraft(getDraftFromFilters(filters))
  }, [filters.status, filters.keyword, filters.startDate, filters.endDate])

  const handleDraftChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApply(draft)
  }

  const handleReset = () => {
    onReset()
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(draft.keyword)
    }
  }

  const getStatusLabel = (value) => {
    if (!value) return t('hr.interview.allStatus') || 'Tất cả trạng thái'
    const option = STATUS_OPTIONS.find(opt => opt.value === value)
    return option ? t(option.labelKey) : value
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
          <h3 className="text-sm font-semibold text-brand-secondary dark:text-white">
            {t('hr.interview.filters') || 'Bộ lọc'}
          </h3>
          <button
            onClick={handleReset}
            className="text-xs text-brand-text/60 dark:text-gray-400 hover:text-brand-primary transition-colors cursor-pointer font-medium"
          >
            {t('hr.interview.clearFilters') || 'Xóa tất cả'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {/* Search */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.interview.search') || 'Tìm kiếm'}
            </label>
            <input
              type="text"
              value={draft.keyword}
              onChange={(e) => handleDraftChange('keyword', e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('hr.interview.searchPlaceholder') || 'Tìm ứng viên, vị trí...'}
              className="w-full h-[42px] px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Status */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.interview.status') || 'Trạng thái'}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-[42px] flex items-center justify-between px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer shadow-sm">
                  <span className="truncate flex-1 text-left">
                    {getStatusLabel(draft.status)}
                  </span>
                  <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
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

          {/* Start Date */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.interview.fromDate') || 'Từ ngày'}
            </label>
            <input
              type="date"
              value={draft.startDate}
              onChange={(e) => handleDraftChange('startDate', e.target.value)}
              className="w-full h-[42px] px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* End Date */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.interview.toDate') || 'Đến ngày'}
            </label>
            <input
              type="date"
              value={draft.endDate}
              onChange={(e) => handleDraftChange('endDate', e.target.value)}
              className="w-full h-[42px] px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 shadow-sm"
            />
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

export default InterviewFilters