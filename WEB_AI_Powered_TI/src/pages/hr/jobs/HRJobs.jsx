import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/hr/job.api'

import JobHeader from '~/components/hr/jobs/JobHeader'
import JobFilters from '~/components/hr/jobs/JobFilters'
import JobTable from '~/components/hr/jobs/JobTable'
import JobEmptyState from '~/components/hr/jobs/JobEmptyState'
import JobFormModal from '~/components/hr/jobs/JobFormModal'

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
  keyword: '',
  experienceLevel: '',
  employmentType: '',
  isActive: '',
  categoryId: '',
  sortBy: 'created_at',
  sortOrder: 'DESC',
  page: 1,
  limit: 20
}

const HRJobs = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const skipAutoFetch = useRef(false)

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [jobs, setJobs] = useState([])
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    page: 1,
    totalPages: 0
  })
  const [error, setError] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter state
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    employmentType: searchParams.get('employmentType') || '',
    isActive: searchParams.get('isActive') || '',
    categoryId: searchParams.get('categoryId') || '',
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: searchParams.get('sortOrder') || 'DESC',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20
  })

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await jobApi.getCategoryDropdown()
      if (response.success) {
        setCategories(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }, [])

  // Fetch jobs
  const fetchJobsWithParams = useCallback(async (customFilters) => {
    setIsTableLoading(true)
    setError(null)
    try {
      const params = {
        keyword: customFilters.keyword || undefined,
        experienceLevel: customFilters.experienceLevel || undefined,
        employmentType: customFilters.employmentType || undefined,
        isActive: customFilters.isActive !== '' ? customFilters.isActive === 'true' : undefined,
        categoryId: customFilters.categoryId || undefined,
        sortBy: customFilters.sortBy || 'created_at',
        sortOrder: customFilters.sortOrder || 'DESC',
        limit: customFilters.limit || 20,
        page: customFilters.page || 1
      }

      Object.keys(params).forEach(key =>
        params[key] === undefined && delete params[key]
      )

      const response = await jobApi.getJobs(params)

      if (response.success) {
        setJobs(response.data || [])
        setPagination({
          total: response.pagination?.total || 0,
          limit: response.pagination?.limit || 20,
          page: response.pagination?.page || 1,
          totalPages: response.pagination?.totalPages || 0
        })
      } else {
        setError(response.message || 'Không thể tải danh sách công việc')
        toast.error(response.message || 'Không thể tải danh sách công việc')
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách công việc')
      toast.error('Không thể tải danh sách công việc')
    } finally {
      setIsTableLoading(false)
    }
  }, [])

  const fetchJobs = useCallback(() => {
    return fetchJobsWithParams(filters)
  }, [filters, fetchJobsWithParams])

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchCategories(), fetchJobsWithParams(filters)])
    setIsLoading(false)
  }, [fetchCategories, fetchJobsWithParams, filters])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [])

  // Fetch when filters change (debounced)
  useEffect(() => {
    if (skipAutoFetch.current) {
      skipAutoFetch.current = false
      return
    }
    const timer = setTimeout(() => {
      fetchJobs()
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
    fetchJobsWithParams(newFilters)
  }

  const handleResetFilters = () => {
    skipAutoFetch.current = true
    setFilters(DEFAULT_FILTERS)
    fetchJobsWithParams(DEFAULT_FILTERS)
  }

  const handleSearch = (keyword) => {
    const newFilters = { ...filters, keyword, page: 1 }
    skipAutoFetch.current = true
    setFilters(newFilters)
    fetchJobsWithParams(newFilters)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const currentJobIds = jobs.map(j => j.id).filter(id => id)
      setSelectedIds(currentJobIds)
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

  const handleDelete = async (id) => {
    try {
      const response = await jobApi.deleteJob(id)
      if (response.success) {
        toast.success('Xóa công việc thành công')
        fetchJobs()
      } else {
        toast.error(response.message || 'Xóa thất bại')
      }
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  const handleDeleteBulk = async (ids) => {
    try {
      const response = await jobApi.deleteBulk(ids)
      if (response.success) {
        toast.success(response.message || 'Xóa thành công')
        setSelectedIds([])
        fetchJobs()
      } else {
        toast.error(response.message || 'Xóa thất bại')
      }
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  const handleActivateBulk = async (ids) => {
    try {
      const response = await jobApi.activateBulk(ids)
      if (response.success) {
        toast.success(response.message || 'Kích hoạt thành công')
        setSelectedIds([])
        fetchJobs()
      } else {
        toast.error(response.message || 'Kích hoạt thất bại')
      }
    } catch (err) {
      toast.error('Kích hoạt thất bại')
    }
  }

  const handleDeactivateBulk = async (ids) => {
    try {
      const response = await jobApi.deactivateBulk(ids)
      if (response.success) {
        toast.success(response.message || 'Tạm dừng thành công')
        setSelectedIds([])
        fetchJobs()
      } else {
        toast.error(response.message || 'Tạm dừng thất bại')
      }
    } catch (err) {
      toast.error('Tạm dừng thất bại')
    }
  }

  const handleOpenCreateModal = () => {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (job) => {
    setEditingJob(job)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingJob(null)
  }

  const handleSubmitJob = async (data) => {
    setIsSubmitting(true)
    try {
      let response
      if (editingJob) {
        response = await jobApi.updateJob(editingJob.id, data)
      } else {
        response = await jobApi.createJob(data)
      }

      if (response.success) {
        toast.success(editingJob ? 'Cập nhật công việc thành công' : 'Tạo công việc thành công')
        handleCloseModal()
        fetchJobs()
        fetchCategories()
      } else {
        toast.error(response.message || 'Thao tác thất bại')
      }
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại')
    } finally {
      setIsSubmitting(false)
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
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Header */}
        <JobHeader
          filters={filters}
          onSearch={handleSearch}
          totalCount={pagination.total}
          onOpenCreateModal={handleOpenCreateModal}
        />

        {/* Filters */}
        <JobFilters
          filters={filters}
          categories={categories}
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
              {jobs.length > 0 ? (
                <JobTable
                  jobs={jobs}
                  pagination={pagination}
                  selectedIds={selectedIds}
                  onSelectAll={handleSelectAll}
                  onSelectOne={handleSelectOne}
                  onDelete={handleDelete}
                  onDeleteBulk={handleDeleteBulk}
                  onActivateBulk={handleActivateBulk}
                  onDeactivateBulk={handleDeactivateBulk}
                  onPageChange={(page) => handleFilterChange('page', page)}
                  onSortChange={(sortBy, sortOrder) => {
                    setFilters(prev => ({ ...prev, sortBy, sortOrder }))
                  }}
                  onEdit={handleOpenEditModal}
                  currentSortBy={filters.sortBy}
                  currentSortOrder={filters.sortOrder}
                  isLoading={isTableLoading}
                />
              ) : (
                <JobEmptyState
                  onReset={handleResetFilters}
                  keyword={filters.keyword}
                  onOpenCreateModal={handleOpenCreateModal}
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
              onClick={fetchJobs}
              className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Job Form Modal */}
      <JobFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitJob}
        editingJob={editingJob}
        categories={categories}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default HRJobs