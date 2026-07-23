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
import {
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  getExperienceLabel,
  getEmploymentLabel
} from '~/utils/constant'

const STATUS_OPTIONS = [
  { value: '', labelKey: 'hr.job.all' },
  { value: 'true', labelKey: 'hr.job.active' },
  { value: 'false', labelKey: 'hr.job.inactive' }
]

const getDraftFromFilters = (filters) => ({
  experienceLevel: filters.experienceLevel || '',
  employmentType: filters.employmentType || '',
  isActive: filters.isActive || '',
  categoryId: filters.categoryId || ''
})

const JobFilters = ({
  filters,
  categories = [],
  onFilterChange,
  onApply,
  onReset
}) => {
  const { t } = useLanguage()

  const [draft, setDraft] = useState(() => getDraftFromFilters(filters))

  useEffect(() => {
    setDraft(getDraftFromFilters(filters))
  }, [filters.experienceLevel, filters.employmentType, filters.isActive, filters.categoryId])

  const handleDraftChange = (key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onApply(draft)
  }

  const handleReset = () => {
    onReset()
  }

  const getExperienceLabelText = (value) => getExperienceLabel(value, t)
  const getEmploymentLabelText = (value) => getEmploymentLabel(value, t)

  const getStatusLabelText = (value) => {
    if (!value) return t('hr.job.all') || 'Tất cả'
    const option = STATUS_OPTIONS.find(opt => opt.value === value)
    return option ? t(option.labelKey) : t('hr.job.all') || 'Tất cả'
  }

  const getCategoryLabelText = (value) => {
    if (!value) return t('hr.job.allCategories') || 'Tất cả danh mục'
    const category = categories.find(c => c.id === value)
    return category ? category.name : t('hr.job.allCategories') || 'Tất cả danh mục'
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
            {t('hr.job.filters') || 'Bộ lọc'}
          </h3>
          <button
            onClick={handleReset}
            className="text-xs text-brand-text/60 dark:text-gray-400 hover:text-brand-primary transition-colors cursor-pointer font-medium"
          >
            {t('hr.job.clearFilters') || 'Xóa tất cả'}
          </button>
        </div>

        {/* ĐỔI xl:grid-cols-4 THÀNH lg:grid-cols-4 để form cân bằng sớm hơn trên màn hình laptop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

          {/* Category */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.job.category') || 'Danh mục'}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* THÊM h-[42px] (hoặc h-10) để các ô luôn cao bằng nhau */}
                <button className="w-full h-[42px] flex items-center justify-between px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer shadow-sm">
                  <span className="truncate flex-1 text-left">
                    {getCategoryLabelText(draft.categoryId)}
                  </span>
                  <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              {/* THÊM w-[var(--radix-dropdown-menu-trigger-width)] hoặc min-w-[200px] để menu dropdown rộng bằng chính ô input (nếu dùng shadcn/ui) */}
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                <DropdownMenuItem
                  onClick={() => handleDraftChange('categoryId', '')}
                  className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                    draft.categoryId === ''
                      ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                      : 'text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {t('hr.job.allCategories') || 'Tất cả danh mục'}
                </DropdownMenuItem>
                {categories.map((cat) => (
                  <DropdownMenuItem
                    key={cat.id}
                    onClick={() => handleDraftChange('categoryId', cat.id)}
                    className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      draft.categoryId === cat.id
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                        : 'text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Experience Level */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.job.experienceLevel') || 'Cấp bậc'}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-[42px] flex items-center justify-between px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer shadow-sm">
                  <span className="truncate flex-1 text-left">
                    {getExperienceLabelText(draft.experienceLevel)}
                  </span>
                  <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                {EXPERIENCE_LEVELS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleDraftChange('experienceLevel', opt.value)}
                    className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      draft.experienceLevel === opt.value
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                        : 'text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {getExperienceLabelText(opt.value)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Employment Type */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.job.employmentType') || 'Loại hình'}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-[42px] flex items-center justify-between px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer shadow-sm">
                  <span className="truncate flex-1 text-left">
                    {getEmploymentLabelText(draft.employmentType)}
                  </span>
                  <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                {EMPLOYMENT_TYPES.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleDraftChange('employmentType', opt.value)}
                    className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      draft.employmentType === opt.value
                        ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                        : 'text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {getEmploymentLabelText(opt.value)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status */}
          <div className="min-w-0 flex flex-col">
            <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1.5">
              {t('hr.job.status') || 'Trạng thái'}
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full h-[42px] flex items-center justify-between px-3.5 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer shadow-sm">
                  <span className="truncate flex-1 text-left">
                    {getStatusLabelText(draft.isActive)}
                  </span>
                  <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] p-1 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleDraftChange('isActive', opt.value)}
                    className={`cursor-pointer px-3 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      draft.isActive === opt.value
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

export default JobFilters