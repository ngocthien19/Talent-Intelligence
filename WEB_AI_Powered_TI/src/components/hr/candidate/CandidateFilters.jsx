import { motion, AnimatePresence } from 'framer-motion'
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

const CandidateFilters = ({
  isOpen,
  filters,
  onFilterChange,
  onApply,
  onReset
}) => {
  const { t } = useLanguage()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0, y: -10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 overflow-hidden"
        >
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-brand-secondary dark:text-white">
                {t('hr.candidate.filters') || 'Bộ lọc nâng cao'}
              </h3>
              <button
                onClick={onReset}
                className="text-xs text-brand-text/60 dark:text-gray-400 hover:text-brand-primary transition-colors cursor-pointer"
              >
                {t('hr.candidate.clearFilters') || 'Xóa tất cả'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div>
                <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
                  {t('hr.candidate.status') || 'Trạng thái'}
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => onFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey) || opt.value}
                    </option>
                  ))}
                </select>
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
                  value={filters.minScore || ''}
                  onChange={(e) => onFilterChange('minScore', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                />
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
                  value={filters.maxScore || ''}
                  onChange={(e) => onFilterChange('maxScore', e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                />
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
                  {t('hr.candidate.sortBy') || 'Sắp xếp theo'}
                </label>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy || 'created_at'}
                    onChange={(e) => onFilterChange('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                  >
                    <option value="created_at">{t('hr.candidate.date') || 'Ngày ứng tuyển'}</option>
                    <option value="name">{t('hr.candidate.name') || 'Tên'}</option>
                    <option value="overall_score">{t('hr.candidate.score') || 'Điểm'}</option>
                    <option value="position_applied">{t('hr.candidate.position') || 'Vị trí'}</option>
                    <option value="status">{t('hr.candidate.status') || 'Trạng thái'}</option>
                  </select>
                  <button
                    onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'DESC' ? 'ASC' : 'DESC')}
                    className="px-3 py-2 border border-brand-light/50 dark:border-gray-700 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
                  >
                    {filters.sortOrder === 'DESC' ? '↓' : '↑'}
                  </button>
                </div>
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
                  {t('hr.fromDate') || 'Từ ngày'}
                </label>
                <input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => onFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-brand-text/60 dark:text-gray-400 block mb-1">
                  {t('hr.toDate') || 'Đến ngày'}
                </label>
                <input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => onFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-brand-light/50 dark:border-gray-700">
              <button
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white transition-colors cursor-pointer"
              >
                {t('common.reset') || 'Đặt lại'}
              </button>
              <button
                onClick={onApply}
                className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                {t('common.apply') || 'Áp dụng'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CandidateFilters