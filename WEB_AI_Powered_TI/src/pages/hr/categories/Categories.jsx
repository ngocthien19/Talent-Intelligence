import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { categoryApi } from '~/api/hr/category.api'

import CategoryHeader from '~/components/hr/category/CategoryHeader'
import CategoryStats from '~/components/hr/category/CategoryStats'
import CategoryFilters from '~/components/hr/category/CategoryFilters'
import CategoryTable from '~/components/hr/category/CategoryTable'
import CategoryEmptyState from '~/components/hr/category/CategoryEmptyState'
import CategoryFormModal from '~/components/hr/category/CategoryFormModal'
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
  keyword: '',
  isActive: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 20
}

const Categories = () => {
  usePageTitle('hr.categories', 'Danh mục')
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const skipAutoFetch = useRef(false)

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [stats, setStats] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    page: 1,
    totalPages: 0
  })
  const [error, setError] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    isActive: searchParams.get('isActive') || '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 20
  })

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await categoryApi.getStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  // Fetch categories
  const fetchCategoriesWithParams = useCallback(async (customFilters) => {
    setIsTableLoading(true)
    setError(null)
    try {
      const params = {
        keyword: customFilters.keyword || undefined,
        isActive: customFilters.isActive || undefined,
        startDate: customFilters.startDate || undefined,
        endDate: customFilters.endDate || undefined,
        limit: customFilters.limit || 20,
        page: customFilters.page || 1
      }

      Object.keys(params).forEach(key =>
        params[key] === undefined && delete params[key]
      )

      const response = await categoryApi.getCategories(params)

      if (response.success) {
        setCategories(response.data || [])
        setPagination({
          total: response.pagination?.total || 0,
          limit: response.pagination?.limit || 20,
          page: response.pagination?.page || 1,
          totalPages: response.pagination?.totalPages || 0
        })
      } else {
        setError(response.message || 'Không thể tải danh sách danh mục')
        toast.error(response.message || 'Không thể tải danh sách danh mục')
      }
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách danh mục')
      toast.error('Không thể tải danh sách danh mục')
    } finally {
      setIsTableLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(() => {
    return fetchCategoriesWithParams(filters)
  }, [filters, fetchCategoriesWithParams])

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([fetchStats(), fetchCategoriesWithParams(filters)])
    setIsLoading(false)
  }, [fetchStats, fetchCategoriesWithParams, filters])

  // Initial load
  useEffect(() => {
    fetchAll()
  }, [])

  // Fetch when filters change
  useEffect(() => {
    if (skipAutoFetch.current) {
      skipAutoFetch.current = false
      return
    }
    const timer = setTimeout(() => {
      fetchCategories()
    }, 300)
    return () => clearTimeout(timer)
  }, [filters.keyword, filters.page, filters.limit])

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
  const handleApplyFilters = (draftValues) => {
    const newFilters = { ...filters, ...draftValues, page: 1 }
    setFilters(newFilters)
    fetchCategoriesWithParams(newFilters)
  }

  const handleResetFilters = () => {
    skipAutoFetch.current = true
    setFilters(DEFAULT_FILTERS)
    fetchCategoriesWithParams(DEFAULT_FILTERS)
  }

  const handleSearch = (keyword) => {
    const newFilters = { ...filters, keyword, page: 1 }
    skipAutoFetch.current = true
    setFilters(newFilters)
    fetchCategoriesWithParams(newFilters)
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(categories.map(c => c.id))
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

  const handleOpenCreateModal = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (category) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
  }

  const handleSubmitCategory = async (data) => {
    setIsSubmitting(true)
    try {
      let response
      if (editingCategory) {
        response = await categoryApi.updateCategory(editingCategory.id, data)
        if (response.success) {
          toast.success(t('hr.category.updateSuccess') || 'Cập nhật danh mục thành công')
        }
      } else {
        response = await categoryApi.createCategory(data)
        if (response.success) {
          toast.success(t('hr.category.createSuccess') || 'Tạo danh mục thành công')
        }
      }

      if (response.success) {
        handleCloseModal()
        fetchCategories()
        fetchStats()
      } else {
        toast.error(response.message || 'Thao tác thất bại')
      }
    } catch (err) {
      toast.error(err.message || 'Thao tác thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatusBulk = async (ids, isActive) => {
    try {
      const response = await categoryApi.updateStatusBulk(ids, isActive)
      if (response.success) {
        toast.success(isActive ? 'Kích hoạt hàng loạt thành công' : 'Tạm dừng hàng loạt thành công')
        setSelectedIds([])
        fetchCategories()
        fetchStats()
      } else {
        toast.error(response.message || 'Cập nhật trạng thái thất bại')
      }
    } catch (err) {
      toast.error(err.message || 'Cập nhật trạng thái thất bại')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await categoryApi.deleteCategory(id)
      if (response.success) {
        toast.success(t('hr.category.deleteSuccess') || 'Xóa danh mục thành công')
        fetchCategories()
        fetchStats()
      } else {
        toast.error(response.message || 'Xóa thất bại')
      }
    } catch (err) {
      toast.error(err.message || 'Xóa thất bại')
    }
  }

  const handleDeleteBulk = async (ids) => {
    try {
      const response = await categoryApi.deleteBulk(ids)
      if (response.success) {
        toast.success(response.message || 'Xóa thành công')
        setSelectedIds([])
        fetchCategories()
        fetchStats()
      } else {
        toast.error(response.message || 'Xóa thất bại')
      }
    } catch (err) {
      toast.error('Xóa thất bại')
    }
  }

  const handleToggleStatus = async (id, isActive) => {
    try {
      const response = await categoryApi.updateStatus(id, isActive)
      if (response.success) {
        toast.success(isActive ? 'Kích hoạt thành công' : 'Tạm dừng thành công')
        fetchCategories()
        fetchStats()
      } else {
        toast.error(response.message || 'Cập nhật trạng thái thất bại')
      }
    } catch (err) {
      toast.error('Cập nhật trạng thái thất bại')
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
        <CategoryHeader
          filters={filters}
          onSearch={handleSearch}
          totalCount={pagination.total}
          onOpenCreateModal={handleOpenCreateModal}
        />

        {/* Stats */}
        <CategoryStats stats={stats} />

        {/* Filters */}
        <CategoryFilters
          filters={filters}
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
              {categories.length > 0 ? (
                <CategoryTable
                  categories={categories}
                  pagination={pagination}
                  selectedIds={selectedIds}
                  onSelectAll={handleSelectAll}
                  onSelectOne={handleSelectOne}
                  onDelete={handleDelete}
                  onDeleteBulk={handleDeleteBulk}
                  onToggleStatus={handleToggleStatus}
                  onToggleStatusBulk={handleToggleStatusBulk}
                  onEdit={handleOpenEditModal}
                  onPageChange={(page) => {
                    const newFilters = { ...filters, page }
                    setFilters(newFilters)
                    fetchCategoriesWithParams(newFilters)
                  }}
                  isLoading={isTableLoading}
                />
              ) : (
                <CategoryEmptyState
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
              onClick={fetchCategories}
              className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
        editingCategory={editingCategory}
        isSubmitting={isSubmitting}
      />
    </>
  )
}

export default Categories