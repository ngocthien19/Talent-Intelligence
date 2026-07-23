import { useState, useEffect, useCallback } from 'react'
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

const Candidates = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

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
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Filter state
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

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    setIsTableLoading(true)
    setError(null)
    try {
      const params = {
        status: filters.status || undefined,
        keyword: filters.keyword || undefined,
        minScore: filters.minScore ? parseFloat(filters.minScore) : undefined,
        maxScore: filters.maxScore ? parseFloat(filters.maxScore) : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'DESC',
        limit: filters.limit || 20,
        page: filters.page || 1
      }

      // Clean undefined params
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
  }, [filters])

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchWidgets(), fetchCandidates()])
    setIsLoading(false)
  }, [fetchWidgets, fetchCandidates])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [])

  // Fetch when filters change (debounced)
  useEffect(() => {
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

  // Handlers
  const handleFilterChange = (key, value) => {
    if (key === 'page') {
      setFilters(prev => ({ ...prev, page: value }))
      return
    }
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleApplyFilters = () => {
    fetchCandidates()
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
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
    })
    setIsFilterOpen(false)
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
    if (!confirm('Bạn có chắc chắn muốn xóa ứng viên này?')) return

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
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        selectedCount={selectedIds.length}
        totalCount={pagination.total}
        onRefresh={fetchAll}
        isRefreshing={isLoading}
      />

      {/* Stats */}
      <CandidateStats widgets={widgets} />

      {/* Filters */}
      <CandidateFilters
        isOpen={isFilterOpen}
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
                onPageChange={(page) => handleFilterChange('page', page)}
                onSortChange={(sortBy, sortOrder) => {
                  setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                }}
                currentSortBy={filters.sortBy}
                currentSortOrder={filters.sortOrder}
                isLoading={isTableLoading}
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
    </motion.div>
  )
}

export default Candidates