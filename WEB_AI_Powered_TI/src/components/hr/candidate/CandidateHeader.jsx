import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaSearch } from 'react-icons/fa'
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

const CandidateHeader = ({
  filters,
  onSearch,
  totalCount
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

  // Kiểm tra có filter nào đang active không
  const hasActiveFilters = Object.keys(filters).some(key =>
    ['status', 'minScore', 'maxScore', 'startDate', 'endDate'].includes(key) && filters[key]
  )

  // Tạo mô tả kết quả
  const getResultText = () => {
    if (totalCount === 0) {
      return t('hr.candidate.noResults') || 'Không tìm thấy ứng viên nào'
    }

    let parts = []
    const keyword = filters.keyword?.trim()
    const status = filters.status
    const hasScoreFilter = filters.minScore || filters.maxScore
    const hasDateFilter = filters.startDate || filters.endDate

    if (keyword) {
      parts.push(`"${keyword}"`)
    }
    if (status) {
      const statusLabel = t(`hr.candidate.${status}`) || status
      parts.push(t('hr.candidate.withStatus') || `trạng thái ${statusLabel}`)
    }
    if (hasScoreFilter) {
      let scoreText = ''
      if (filters.minScore && filters.maxScore) {
        scoreText = `${filters.minScore} - ${filters.maxScore} điểm`
      } else if (filters.minScore) {
        scoreText = `≥ ${filters.minScore} điểm`
      } else if (filters.maxScore) {
        scoreText = `≤ ${filters.maxScore} điểm`
      }
      if (scoreText) parts.push(scoreText)
    }
    if (hasDateFilter) {
      let dateText = ''
      if (filters.startDate && filters.endDate) {
        const start = new Date(filters.startDate).toLocaleDateString('vi-VN')
        const end = new Date(filters.endDate).toLocaleDateString('vi-VN')
        dateText = `${start} - ${end}`
      } else if (filters.startDate) {
        const start = new Date(filters.startDate).toLocaleDateString('vi-VN')
        dateText = `từ ${start}`
      } else if (filters.endDate) {
        const end = new Date(filters.endDate).toLocaleDateString('vi-VN')
        dateText = `đến ${end}`
      }
      if (dateText) parts.push(dateText)
    }

    if (parts.length === 0 || !hasActiveFilters) {
      return t('hr.candidate.showingAll') || 'Hiển thị tất cả'
    }

    return parts.join(', ')
  }

  return (
    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
          {t('hr.candidates') || 'Quản lý ứng viên'}
        </h1>
        <p className="text-sm text-brand-text/60 dark:text-gray-400">
          {totalCount === 0 ? (
            <span className="text-red-500 font-medium">
              {t('hr.candidate.noResults') || 'Không tìm thấy ứng viên nào'}
            </span>
          ) : (
            <>
              <span>{t('hr.candidate.showing') || 'Hiển thị'}</span>{' '}
              <span className="font-bold text-brand-primary text-base">
                {totalCount}
              </span>{' '}
              <span>{t('hr.candidate.candidates') || 'ứng viên'}</span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Search - chỉ tìm khi nhấn Enter */}
        <div className="relative">
          <input
            type="text"
            placeholder={t('hr.search') || 'Tìm kiếm ứng viên... (Enter để tìm)'}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-48 md:w-72 px-4 py-2 pl-10 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={14} />
        </div>
      </div>
    </motion.div>
  )
}

export default CandidateHeader