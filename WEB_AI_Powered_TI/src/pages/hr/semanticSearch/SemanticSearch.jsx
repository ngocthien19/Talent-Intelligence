import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { FaSpinner } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { semanticSearchApi } from '~/api/hr/semantic-search.api'

import SemanticSearchHeader from '~/components/hr/semanticSearch/SemanticSearchHeader'
import SemanticSearchBar from '~/components/hr/semanticSearch/SemanticSearchBar'
import SemanticSearchFilters from '~/components/hr/semanticSearch/SemanticSearchFilters'
import SemanticSearchResults from '~/components/hr/semanticSearch/SemanticSearchResults'
import SemanticSearchEmptyState from '~/components/hr/semanticSearch/SemanticSearchEmptyState'
import SemanticSearchLoading from '~/components/hr/semanticSearch/SemanticSearchLoading'
import usePageTitle from '~/hooks/usePageTitle'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const DEFAULT_FILTERS = {
  status: '',
  minScore: '',
  maxScore: '',
  startDate: '',
  endDate: ''
}

const SemanticSearch = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const skipAutoFetch = useRef(false)
  usePageTitle('hr.searchTitle', 'Tìm kiếm ứng viên')

  // Lấy initial values từ URL params
  const initialQuery = searchParams.get('q') || ''
  const initialFilters = {
    status: searchParams.get('status') || '',
    minScore: searchParams.get('minScore') || '',
    maxScore: searchParams.get('maxScore') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || ''
  }

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [hasSearched, setHasSearched] = useState(false)
  const [isEmbeddingReady, setIsEmbeddingReady] = useState(false)

  // Filters - lưu giá trị hiện tại đang áp dụng
  const [filters, setFilters] = useState(initialFilters)

  // Khi vào trang, tự động khởi tạo embedding ngầm
  useEffect(() => {
    initializeEmbeddings()
  }, [])

  // Nếu có query trong URL, tự động search khi load xong
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        performSearch(initialQuery, initialFilters)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  // Khởi tạo embedding ngầm
  const initializeEmbeddings = async () => {
    try {
      setIsInitializing(true)

      const testResponse = await semanticSearchApi.semanticSearch('test', { limit: 1 })

      if (testResponse.success) {
        setIsEmbeddingReady(true)
        setIsInitializing(false)
        return
      }

      const response = await semanticSearchApi.generateAllEmbeddings()

      if (response.success) {
        setIsEmbeddingReady(true)
      } else {
        setIsEmbeddingReady(false)
      }
    } catch (error) {
      setIsEmbeddingReady(false)
    } finally {
      setIsInitializing(false)
    }
  }

  // Cập nhật URL params
  const updateUrlParams = (query, filterValues) => {
    const params = {}

    if (query && query.trim()) {
      params.q = query.trim()
    }

    if (filterValues.status) params.status = filterValues.status
    if (filterValues.minScore) params.minScore = filterValues.minScore
    if (filterValues.maxScore) params.maxScore = filterValues.maxScore
    if (filterValues.startDate) params.startDate = filterValues.startDate
    if (filterValues.endDate) params.endDate = filterValues.endDate

    setSearchParams(params, { replace: true })
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      toast.warning(t('hr.search.minChars') || 'Vui lòng nhập ít nhất 2 ký tự để tìm kiếm')
      return
    }

    if (isInitializing) {
      toast.info(t('hr.search.initializingWait') || 'Đang khởi tạo dữ liệu, vui lòng đợi...')
      return
    }

    if (!isEmbeddingReady) {
      setIsLoading(true)
      await initializeEmbeddings()
      setIsLoading(false)
      if (!isEmbeddingReady) {
        toast.error(t('hr.search.initFailed') || 'Không thể khởi tạo dữ liệu tìm kiếm, vui lòng thử lại sau')
        return
      }
    }

    // Cập nhật URL và search
    updateUrlParams(searchQuery, filters)
    await performSearch(searchQuery, filters)
  }

  const performSearch = async (query, filterValues) => {
    setIsLoading(true)
    setHasSearched(true)
    try {
      const response = await semanticSearchApi.semanticSearch(query.trim(), {
        ...filterValues,
        limit: 50
      })

      if (response.success) {
        setResults(response.data || [])
        setTotal(response.total || 0)
      } else {
        toast.error(response.message || 'Không thể tìm kiếm')
        setResults([])
        setTotal(0)
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi tìm kiếm')
      setResults([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Khi nhấn Apply trong Filters
  const handleApplyFilters = (draftValues) => {
    const newFilters = { ...filters, ...draftValues }
    setFilters(newFilters)

    // Nếu đã có search query, thực hiện search với filter mới
    if (searchQuery.trim()) {
      updateUrlParams(searchQuery, newFilters)
      performSearch(searchQuery, newFilters)
    }
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    // Reset URL params, giữ lại query nếu có
    const params = {}
    if (searchQuery && searchQuery.trim()) {
      params.q = searchQuery.trim()
    }
    setSearchParams(params, { replace: true })
  }

  const handleClearResults = () => {
    setSearchQuery('')
    setResults([])
    setTotal(0)
    setHasSearched(false)
    setFilters(DEFAULT_FILTERS)
    setSearchParams({}, { replace: true })
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <SemanticSearchHeader total={total} query={searchQuery} />

      {/* Search Bar */}
      <SemanticSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isLoading={isLoading}
        onSearch={handleSearch}
      />

      {/* Filters */}
      <SemanticSearchFilters
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Trạng thái đang khởi tạo ngầm */}
      {isInitializing && (
        <div className="flex items-center gap-3 text-sm text-brand-text/60 dark:text-gray-400 bg-brand-light/10 dark:bg-gray-800/50 px-4 py-2 rounded-lg">
          <FaSpinner className="animate-spin text-brand-primary" size={16} />
          <span>{t('hr.search.initializing') || 'Đang khởi tạo dữ liệu tìm kiếm...'}</span>
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SemanticSearchLoading key="loading" />
        ) : hasSearched ? (
          results.length > 0 ? (
            <SemanticSearchResults
              key="results"
              results={results}
              total={total}
              query={searchQuery}
              onClear={handleClearResults}
              isLoading={isLoading}
            />
          ) : (
            <SemanticSearchEmptyState key="empty" hasSearched={true} onReset={handleClearResults} />
          )
        ) : (
          <SemanticSearchEmptyState key="initial" hasSearched={false} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default SemanticSearch