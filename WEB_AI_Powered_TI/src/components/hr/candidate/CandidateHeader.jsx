import { motion } from 'framer-motion'
import {
  FaSearch,
  FaFilter,
  FaPlus,
  FaDownload,
  FaSync,
  FaCheckCircle,
  FaTimes
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { Link } from 'react-router-dom'

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

const CandidateHeader = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  isFilterOpen,
  setIsFilterOpen,
  selectedCount,
  totalCount,
  onRefresh,
  isRefreshing
}) => {
  const { t } = useLanguage()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onApplyFilters()
    }
  }

  // Kiểm tra có filter nào đang active không
  const hasActiveFilters = Object.keys(filters).some(key =>
    ['status', 'minScore', 'maxScore', 'startDate', 'endDate'].includes(key) && filters[key]
  )

  return (
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
          {t('hr.candidates') || 'Quản lý ứng viên'}
        </h1>
        <p className="text-sm text-brand-text/60 dark:text-gray-400">
          {totalCount > 0
            ? `${t('hr.candidate.showing') || 'Hiển thị'} ${totalCount} ${t('hr.candidate.candidates') || 'ứng viên'}`
            : t('hr.candidate.noCandidates') || 'Chưa có ứng viên nào'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('hr.search') || 'Tìm kiếm ứng viên...'}
            value={filters.keyword}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-48 md:w-64 px-4 py-2 pl-10 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={14} />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
            isFilterOpen
              ? 'bg-brand-primary text-white border-brand-primary'
              : 'border-brand-light/50 dark:border-gray-700 text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
          }`}
        >
          <FaFilter size={14} />
          <span className="hidden sm:inline">{t('hr.candidate.filters') || 'Bộ lọc'}</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          )}
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg border border-brand-light/50 dark:border-gray-700 text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaSync className={`${isRefreshing ? 'animate-spin' : ''}`} size={14} />
        </button>

        {/* Export */}
        <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95">
          <FaDownload size={14} />
          {t('hr.exportReport') || 'Xuất báo cáo'}
        </button>

        {/* Add candidate */}
        <Link
          to="/hr/candidates/new"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <FaPlus size={14} />
          <span className="hidden sm:inline">{t('hr.candidate.add') || 'Thêm ứng viên'}</span>
        </Link>
      </div>

      {/* Selection info */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 px-3 py-1.5 bg-brand-primary/10 dark:bg-brand-primary/20 rounded-lg text-sm text-brand-primary">
          <FaCheckCircle size={14} />
          <span>
            {t('hr.candidate.selected') || 'Đã chọn'} {selectedCount} {t('hr.candidate.candidate') || 'ứng viên'}
          </span>
          <button
            onClick={() => onFilterChange('selected', [])}
            className="hover:text-brand-secondary transition-colors cursor-pointer"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default CandidateHeader