import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaSearch, FaSpinner, FaUser } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { candidateApi } from '~/api/hr/candidate.api'

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

const AnalyticsSearch = ({ onSelectCandidate, selectedCandidate }) => {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      return
    }

    setIsLoading(true)
    setShowResults(true)
    try {
      const response = await candidateApi.getCandidates({
        keyword: searchQuery.trim(),
        limit: 10,
        page: 1
      })
      if (response.success) {
        setResults(response.data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelect = (candidate) => {
    onSelectCandidate(candidate)
    setShowResults(false)
    setSearchQuery(candidate.name)
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
            onFocus={() => searchQuery.trim().length >= 2 && setShowResults(true)}
            placeholder={t('hr.analytics.searchPlaceholder') || 'Nhập tên hoặc email ứng viên...'}
            className="w-full pl-11 pr-4 py-3 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-3 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
        >
          {isLoading ? (
            <FaSpinner className="animate-spin" size={16} />
          ) : (
            <FaSearch size={16} />
          )}
          {t('hr.analytics.search') || 'Tìm kiếm'}
        </button>
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="relative mt-2">
          <div className="absolute left-0 right-0 z-10 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <FaSpinner className="animate-spin text-brand-primary" size={20} />
              </div>
            ) : results.length > 0 ? (
              results.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => handleSelect(candidate)}
                  className="w-full text-left px-4 py-2.5 hover:bg-brand-light/30 dark:hover:bg-gray-800 transition-all duration-150 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                    {candidate.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-secondary dark:text-white">
                      {candidate.name}
                    </p>
                    <p className="text-xs text-brand-text/60 dark:text-gray-400">
                      {candidate.email} • {candidate.position_applied || 'Chưa có vị trí'}
                    </p>
                  </div>
                </button>
              ))
            ) : searchQuery.trim().length >= 2 ? (
              <div className="px-4 py-4 text-center text-sm text-brand-text/60 dark:text-gray-400">
                {t('hr.analytics.noResults') || 'Không tìm thấy ứng viên'}
              </div>
            ) : null}
            {results.length > 0 && (
              <div className="border-t border-brand-light/50 dark:border-gray-700 px-4 py-2 text-center">
                <button
                  onClick={() => setShowResults(false)}
                  className="text-xs text-brand-text/40 dark:text-gray-500 hover:text-brand-primary transition-colors"
                >
                  {t('common.close') || 'Đóng'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected candidate */}
      {selectedCandidate && (
        <div className="mt-3 p-3 bg-brand-light/10 dark:bg-gray-800/50 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {selectedCandidate.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-medium text-brand-secondary dark:text-white">{selectedCandidate.name}</p>
            <p className="text-xs text-brand-text/60 dark:text-gray-400">
              {selectedCandidate.email} • {selectedCandidate.position_applied || 'Chưa có vị trí'}
            </p>
          </div>
          <button
            onClick={() => {
              onSelectCandidate(null)
              setSearchQuery('')
            }}
            className="text-brand-text/40 dark:text-gray-500 hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default AnalyticsSearch