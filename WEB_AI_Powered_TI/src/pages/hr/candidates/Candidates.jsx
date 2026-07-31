import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { candidateApi } from '~/api/hr/candidate.api'
import { analysisApi } from '~/api/hr/analysis.api'
import { enrichmentApi } from '~/api/hr/enrichment.api'
import { reportApi } from '~/api/hr/report.api'

import CandidateHeader from '~/components/hr/candidate/CandidateHeader'
import CandidateStats from '~/components/hr/candidate/CandidateStats'
import CandidateFilters from '~/components/hr/candidate/CandidateFilters'
import CandidateTable from '~/components/hr/candidate/CandidateTable'
import CandidateEmptyState from '~/components/hr/candidate/CandidateEmptyState'
import ComparisonModal from '~/components/hr/comparison/ComparisonModal'
import AnalysisResultModal from '~/components/hr/candidate/AnalysisResultModal'

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

const ANALYSIS_POLL_INTERVAL_MS = 1200
const ANALYSIS_POLL_MAX_ATTEMPTS = 30

const Candidates = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  const skipAutoFetch = useRef(false)
  const pollTimerRef = useRef(null)
  const pollAttemptsRef = useRef(0)
  // Luôn đọc được giá trị mới nhất ngay khi set, không bị stale closure
  // như khi so sánh qua state `analysisModalCandidate` bên trong 1 setInterval
  // đã được tạo ra từ trước đó.
  const activeModalCandidateIdRef = useRef(null)

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

  // Analysis state
  const [analyzingId, setAnalyzingId] = useState(null)
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false)
  const [analysisModalCandidate, setAnalysisModalCandidate] = useState(null)
  const [analysisModalData, setAnalysisModalData] = useState({
    analysis: null,
    enrichment: null,
    reportSent: false,
    isLoading: false
  })
  const [isSendingReport, setIsSendingReport] = useState(false)

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

  // Dọn dẹp timer polling khi unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    }
  }, [])

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

  // Handlers
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

  const handleCompare = () => {
    if (selectedIds.length < 2) {
      toast.warning(t('hr.comparison.selectAtLeast') || 'Vui lòng chọn ít nhất 2 ứng viên để so sánh')
      return
    }
    if (selectedIds.length > 5) {
      toast.warning(t('hr.comparison.maxFive') || 'Chỉ có thể so sánh tối đa 5 ứng viên')
      return
    }

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
      toast.warning(
        `Ứng viên "${names.join(', ')}" chưa được phân tích. Chỉ những ứng viên đã phân tích mới có thể so sánh.`
      )
      return
    }

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

  const loadAnalysisData = useCallback(async (candidateId) => {
    setAnalysisModalData(prev => ({ ...prev, isLoading: true }))
    try {
      const [analysisRes, enrichRes, reportRes] = await Promise.allSettled([
        analysisApi.getAnalysisResult(candidateId),
        enrichmentApi.getEnrichment(candidateId),
        reportApi.checkSent(candidateId)
      ])

      setAnalysisModalData({
        analysis: analysisRes.status === 'fulfilled' && analysisRes.value.success ? analysisRes.value.data : null,
        enrichment: enrichRes.status === 'fulfilled' && enrichRes.value.success ? enrichRes.value.data : null,
        reportSent: reportRes.status === 'fulfilled' && reportRes.value.success
          ? !!(reportRes.value.data?.is_notified || reportRes.value.data?.report_sent_at)
          : false,
        isLoading: false
      })
    } catch (err) {
      setAnalysisModalData(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Hàm kiểm tra kết quả phân tích (chạy nền, không phụ thuộc modal)
  const checkAnalysisResult = useCallback(async (candidateId) => {
    try {
      const res = await analysisApi.getAnalysisResult(candidateId)
      if (res.success && res.data) {
      // Phân tích hoàn tất!
        toast.success('Phân tích hoàn tất!')
        setAnalyzingId(null)
        pollAttemptsRef.current = 0
        if (pollTimerRef.current) {
          clearInterval(pollTimerRef.current)
          pollTimerRef.current = null
        }

        fetchCandidates()
        fetchWidgets()

        if (activeModalCandidateIdRef.current === candidateId) {
          await loadAnalysisData(candidateId)
          setAnalysisModalData(prev => ({ ...prev, isLoading: false }))
        }

        return true
      }
      return false
    } catch (error) {
      console.debug('Analysis result not ready yet')
      return false
    }
  }, [fetchCandidates, fetchWidgets, loadAnalysisData])

  // Hàm bắt đầu polling nền
  const startBackgroundPolling = useCallback((candidateId) => {
    // Xóa interval cũ nếu có
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }

    pollAttemptsRef.current = 0
    setAnalyzingId(candidateId)

    // KIỂM TRA NGAY LẬP TỨC (không đợi interval đầu tiên)
    checkAnalysisResult(candidateId).then((done) => {
      if (done) return

      // Nếu chưa xong, bắt đầu interval
      pollTimerRef.current = setInterval(async () => {
        pollAttemptsRef.current += 1

        const done = await checkAnalysisResult(candidateId)
        if (done) {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current)
            pollTimerRef.current = null
          }
          return
        }

        // Timeout sau MAX_POLL_ATTEMPTS lần
        if (pollAttemptsRef.current >= ANALYSIS_POLL_MAX_ATTEMPTS) {
          toast.warning(t('hr.candidate.analysisTimeout') || 'Phân tích đang được xử lý. Vui lòng kiểm tra lại sau.')
          setAnalyzingId(null)
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current)
            pollTimerRef.current = null
          }
        }
      }, ANALYSIS_POLL_INTERVAL_MS)
    })
  }, [checkAnalysisResult, t])

  // Nhấn nút "Phân tích"
  const handleAnalyze = useCallback(async (candidate) => {
    if (!candidate) return

    const candidateId = candidate.id
    activeModalCandidateIdRef.current = candidateId
    setAnalysisModalCandidate(candidate)
    setAnalysisModalData({ analysis: null, enrichment: null, reportSent: false, isLoading: true })
    setIsAnalysisModalOpen(true)

    try {
      const response = await analysisApi.analyzeCandidate(candidateId)
      if (response.success) {
        toast.info('Đang phân tích CV...')
        startBackgroundPolling(candidateId)
      } else {
        toast.error(response.message || 'Phân tích thất bại')
        setAnalysisModalData(prev => ({ ...prev, isLoading: false }))
      }
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra')
      setAnalysisModalData(prev => ({ ...prev, isLoading: false }))
    }
  }, [startBackgroundPolling])

  const handleViewAnalysis = useCallback(async (candidate) => {
    activeModalCandidateIdRef.current = candidate.id
    setAnalysisModalCandidate(candidate)
    setIsAnalysisModalOpen(true)
    await loadAnalysisData(candidate.id)
  }, [loadAnalysisData])

  const handleCloseAnalysisModal = () => {
    activeModalCandidateIdRef.current = null
    setIsAnalysisModalOpen(false)
    setAnalysisModalCandidate(null)
  }

  const handleSendReport = async (candidateId) => {
    setIsSendingReport(true)
    try {
      const res = await reportApi.sendReport(candidateId)
      if (res.success) {
        toast.success(t('hr.candidate.sendReportSuccess') || 'Đã gửi báo cáo thành công')
        setAnalysisModalData(prev => ({ ...prev, reportSent: true }))
      } else {
        toast.error(res.message || t('hr.candidate.sendReportFailed') || 'Gửi báo cáo thất bại')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || t('hr.candidate.sendReportFailed') || 'Gửi báo cáo thất bại')
    } finally {
      setIsSendingReport(false)
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
      <CandidateHeader
        filters={filters}
        onSearch={handleSearch}
        totalCount={pagination.total}
      />

      <CandidateStats widgets={widgets} />

      <CandidateFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

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
                onAnalyze={handleAnalyze}
                onViewAnalysis={handleViewAnalysis}
                analyzingId={analyzingId}
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

      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => {
          setIsComparisonOpen(false)
          setComparisonCandidateIds([])
        }}
        candidateIds={comparisonCandidateIds}
      />

      <AnalysisResultModal
        isOpen={isAnalysisModalOpen}
        onClose={handleCloseAnalysisModal}
        candidate={analysisModalCandidate}
        data={analysisModalData}
        onSendReport={handleSendReport}
        isSendingReport={isSendingReport}
      />
    </motion.div>
  )
}

export default Candidates