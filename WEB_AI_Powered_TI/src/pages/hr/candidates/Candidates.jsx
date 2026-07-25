import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { candidateApi } from '~/api/hr/candidate.api'

import CandidateHeader from '~/components/hr/candidate/CandidateHeader'
import CandidateStats from '~/components/hr/candidate/CandidateStats'
import CandidateFilters from '~/components/hr/candidate/CandidateFilters'
import CandidateTable from '~/components/hr/candidate/CandidateTable'
import CandidateEmptyState from '~/components/hr/candidate/CandidateEmptyState'
import ComparisonModal from '~/components/hr/comparison/ComparisonModal'

// Animation variants
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
  keyword: '',
  minScore: '',
  maxScore: '',
  startDate: '',
  endDate: '',
  sortBy: 'created_at',
  sortOrder: 'DESC',
  page: 1,
  limit: 20
}

const Candidates = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const skipAutoFetch = useRef(false)

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [candidates, setCandidates] = useState([])
  const [widgets, setWidgets] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    page: 1,
    totalPages: 0
  })
  const [error, setError] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  // Comparison state
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)
  const [comparisonCandidateIds, setComparisonCandidateIds] = useState([])

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    keyword: searchParams.get('keyword') || '',
    minScore: searchParams.get('minScore') || '',
    maxScore: searchParams.get('maxScore') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20
  })

  // Fetch widgets
  const fetchWidgets = useCallback(async () => {
    try {
      const response = await candidateApi.getWidgets()
      if (response.success && response.data) {
        setWidgets(response.data.widgets || [])
      }
    } catch (err) {
      console.error('Failed to fetch widgets:', err)
    }
  }, [])

  const fetchCandidatesWithParams = useCallback(async (customFilters) => {
    setIsTableLoading(true)
    setError(null)
    try {
      const params = {
        status: customFilters.status || undefined,
        keyword: customFilters.keyword || undefined,
        minScore: customFilters.minScore ? parseFloat(customFilters.minScore) : undefined,
        maxScore: customFilters.maxScore ? parseFloat(customFilters.maxScore) : undefined,
        startDate: customFilters.startDate || undefined,
        endDate: customFilters.endDate || undefined,
        sortBy: customFilters.sortBy || 'created_at',
        sortOrder: customFilters.sortOrder || 'DESC',
        limit: customFilters.limit || 20,
        page: customFilters.page || 1
      }

      Object.keys(params).forEach(key =>
        params[key] === undefined && delete params[key]
      )

      const response = await candidateApi.getCandidates(params)

      if (response.success) {
        setCandidates(response.data || [])
        setPagination({
          total: response.pagination?.total || 0,
          limit: response.pagination?.limit || 20,
          page: response.pagination?.page || 1,
          totalPages: response.pagination?.totalPages || 0
        })
      } else {
        setError(response.message || 'Không thể tải danh sách ứng viên')
        toast.error(response.message || 'Không thể tải danh sách ứng viên')
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách ứng viên')
      toast.error('Không thể tải danh sách ứng viên')
    } finally {
      setIsTableLoading(false)
    }
  }, [])

  const fetchCandidates = useCallback(() => {
    return fetchCandidatesWithParams(filters)
  }, [filters, fetchCandidatesWithParams])

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchWidgets(), fetchCandidatesWithParams(filters)])
    setIsLoading(false)
  }, [fetchWidgets, fetchCandidatesWithParams])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [])

  useEffect(() => {
    if (skipAutoFetch.current) {
      skipAutoFetch.current = false
      return
    }
    const timer = setTimeout(() => {
      fetchCandidates()
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.keyword, filters.page, filters.limit, filters.sortBy, filters.sortOrder])

  // Update URL params
  useEffect(() => {
    const params = {}
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'page' && key !== 'limit') {
        params[key] = filters[key]
      }
    })
    if (filters.page > 1) params.page = filters.page
    if (filters.limit !== 20) params.limit = filters.limit

    setSearchParams(params, { replace: true })
  }, [filters, setSearchParams])

  // Handlers cho các field "live" (keyword, page, sortBy, sortOrder)
  const handleFilterChange = (key, value) => {
    if (key === 'page') {
      setFilters(prev => ({ ...prev, page: value }))
      return
    }
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleApplyFilters = (draftValues) => {
    const newFilters = { ...filters, ...draftValues, page: 1 }
    setFilters(newFilters)
    fetchCandidatesWithParams(newFilters)
  }

  const handleResetFilters = () => {
    skipAutoFetch.current = true
    setFilters(DEFAULT_FILTERS)
    fetchCandidatesWithParams(DEFAULT_FILTERS)
  }

  const handleSearch = (keyword) => {
    const newFilters = { ...filters, keyword, page: 1 }
    skipAutoFetch.current = true
    setFilters(newFilters)
    fetchCandidatesWithParams(newFilters)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(candidates.map(c => c.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id))
    }
  }

  // Handler so sánh
  const handleCompare = () => {
  // 1. Kiểm tra số lượng
    if (selectedIds.length < 2) {
      toast.warning(t('hr.comparison.selectAtLeast') || 'Vui lòng chọn ít nhất 2 ứng viên để so sánh')
      return
    }
    if (selectedIds.length > 5) {
      toast.warning(t('hr.comparison.maxFive') || 'Chỉ có thể so sánh tối đa 5 ứng viên')
      return
    }

    // 2. KIỂM TRA TRẠNG THÁI: Chỉ cho phép so sánh ứng viên đã được phân tích
    const validStatuses = ['analyzed', 'shortlisted', 'interviewed', 'offered', 'hired']

    const invalidCandidates = selectedIds.filter(id => {
      const c = candidates.find(c => c.id === id)
      return !validStatuses.includes(c?.status)
    })

    if (invalidCandidates.length > 0) {
      const names = invalidCandidates.map(id => {
        const c = candidates.find(c => c.id === id)
        return c?.name || 'Không xác định'
      })

      // Hiển thị cảnh báo với danh sách tên ứng viên chưa phân tích
      toast.warning(
        `Ứng viên "${names.join(', ')}" chưa được phân tích. Chỉ những ứng viên đã phân tích mới có thể so sánh.`
      )
      return
    }

    // 3. Kiểm tra có điểm số không (phòng trường hợp status đúng nhưng score null)
    const noScoreCandidates = selectedIds.filter(id => {
      const c = candidates.find(c => c.id === id)
      return c?.overall_score === null || c?.overall_score === undefined
    })

    if (noScoreCandidates.length > 0) {
      const names = noScoreCandidates.map(id => {
        const c = candidates.find(c => c.id === id)
        return c?.name || 'Không xác định'
      })
      toast.warning(
        `Ứng viên "${names.join(', ')}" chưa có điểm số. Vui lòng chọn ứng viên đã được đánh giá.`
      )
      return
    }

    // 4. Mở modal so sánh
    setComparisonCandidateIds(selectedIds)
    setIsComparisonOpen(true)
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await candidateApi.updateStatus(id, status)
      if (response.success) {
        toast.success('Cập nhật trạng thái thành công')
        fetchCandidates()
        fetchWidgets()
      } else {
        toast.error(response.message || 'Cập nhật thất bại')
      }
    } catch (err) {
      toast.error('Cập nhật thất bại')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await candidateApi.deleteCandidate(id)
      if (response.success) {
        toast.success('Xóa ứng viên thành công')
        fetchCandidates()
        fetchWidgets()
      } else {
        toast.error(response.message || 'Xóa thất bại')
      }
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  const handleDeleteBulk = async (ids) => {
    try {
      const response = await candidateApi.deleteBulk(ids)
      if (response.success) {
        toast.success(response.message || 'Xóa ứng viên thành công')
        setSelectedIds([])
        fetchCandidates()
        fetchWidgets()
      } else {
        toast.error(response.message || 'Xóa thất bại')
      }
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-brand-primary" size={40} />
          <p className="text-brand-text/60 dark:text-gray-400">{t('common.loading') || 'Đang tải dữ liệu...'}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <CandidateHeader
        filters={filters}
        onSearch={handleSearch}
        totalCount={pagination.total}
      />

      {/* Stats */}
      <CandidateStats widgets={widgets} />

      {/* Filters */}
      <CandidateFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <AnimatePresence mode="wait">
        {!error && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {candidates.length > 0 ? (
              <CandidateTable
                candidates={candidates}
                pagination={pagination}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectOne={handleSelectOne}
                onStatusUpdate={handleStatusUpdate}
                onDelete={handleDelete}
                onDeleteBulk={handleDeleteBulk}
                onPageChange={(page) => handleFilterChange('page', page)}
                onSortChange={(sortBy, sortOrder) => {
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                }}
                currentSortBy={filters.sortBy}
                currentSortOrder={filters.sortOrder}
                isLoading={isTableLoading}
                onCompare={handleCompare}
              />
            ) : (
              <CandidateEmptyState
                onReset={handleResetFilters}
                keyword={filters.keyword}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-8 text-center border border-red-200 dark:border-red-900/30"
        >
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">Có lỗi xảy ra</h3>
          <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">{error}</p>
          <button
            onClick={fetchCandidates}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </motion.div>
      )}

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => {
          setIsComparisonOpen(false)
          setComparisonCandidateIds([])
        }}
        candidateIds={comparisonCandidateIds}
      />
    </motion.div>
  )
}

export default Candidates