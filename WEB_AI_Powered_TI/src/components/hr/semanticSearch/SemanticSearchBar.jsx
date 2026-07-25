import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaSpinner } from 'react-icons/fa'
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

const SemanticSearchBar = ({
  searchQuery,
  setSearchQuery,
  isLoading,
  onSearch
}) => {
  const { t } = useLanguage()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50"
    >
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('hr.search.placeholder') || 'Nhập kỹ năng, kinh nghiệm, vị trí mong muốn...'}
            className="w-full pl-11 pr-4 py-3 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
          />
        </div>
        <button
          type="button"
          onClick={onSearch}
          disabled={isLoading}
          className="px-6 py-3 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" size={16} />
          ) : (
            <FaSearch size={16} />
          )}
          {t('hr.search.search') || 'Tìm kiếm'}
        </button>
      </div>
    </motion.div>
  )
}

export default SemanticSearchBar