import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaPlus } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

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

const JobHeader = ({
  filters,
  onSearch,
  totalCount,
  onOpenCreateModal
}) => {
  const { t } = useLanguage()
  const [searchValue, setSearchValue] = useState(filters.keyword || '')

  useEffect(() => {
    setSearchValue(filters.keyword || '')
  }, [filters.keyword])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchValue.trim())
    }
  }

  return (
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
          {t('hr.jobs') || 'Quản lý việc làm'}
        </h1>
        <p className="text-sm text-brand-text/60 dark:text-gray-400">
          {totalCount > 0
            ? `${t('hr.job.showing') || 'Hiển thị'} ${totalCount} ${t('hr.job.jobs') || 'công việc'}`
            : t('hr.job.noJobs') || 'Chưa có công việc nào'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('hr.job.searchPlaceholder') || 'Tìm kiếm công việc... (Enter để tìm)'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-48 md:w-72 px-4 py-2 pl-10 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={14} />
        </div>

        {/* Add job button */}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <FaPlus size={14} />
          <span className="hidden sm:inline">{t('hr.job.add') || 'Thêm việc làm'}</span>
        </button>
      </div>
    </motion.div>
  )
}

export default JobHeader