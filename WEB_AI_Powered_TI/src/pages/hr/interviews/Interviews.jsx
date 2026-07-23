import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { calendarApi } from '~/api/hr/calendar.api'
import { candidateApi } from '~/api/hr/candidate.api'

import InterviewHeader from '~/components/hr/interviews/InterviewHeader'
import InterviewStats from '~/components/hr/interviews/InterviewStats'
import InterviewFilters from '~/components/hr/interviews/InterviewFilters'
import InterviewTable from '~/components/hr/interviews/InterviewTable'
import InterviewFormModal from '~/components/hr/interviews/InterviewFormModal'
import InterviewDetailModal from '~/components/hr/interviews/InterviewDetailModal'

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

const Interviews = () => {
  const { t } = useLanguage()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [interviews, setInterviews] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [stats, setStats] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [candidates, setCandidates] = useState([])

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    keyword: '',
    startDate: '',
    endDate: ''
  })

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [editingInterview, setEditingInterview] = useState(null)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch interviews
  const fetchInterviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        page: pagination.page,
        limit: 10,
        ...filters
      }
      // Lọc bỏ các giá trị rỗng
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key]
        }
      })

      const response = await calendarApi.getSchedules(params)
      if (response.success) {
        setInterviews(response.data || [])
        if (response.pagination) {
          setPagination(response.pagination)
        }
        if (response.stats) {
          setStats(response.stats)
        }
      } else {
        toast.error(response.message || t('hr.interview.loadError') || 'Không thể tải danh sách lịch phỏng vấn')
      }
    } catch (error) {
      toast.error(error.message || t('hr.interview.loadError') || 'Không thể tải danh sách lịch phỏng vấn')
    } finally {
      setIsLoading(false)
    }
  }, [filters, pagination.page, t])

  // Fetch stats riêng
  const fetchStats = useCallback(async () => {
    try {
      const response = await calendarApi.getScheduleStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }, [])

  // Fetch candidates for dropdown
  const fetchCandidates = useCallback(async () => {
    try {
      const response = await candidateApi.getCandidates({
        limit: 100,
        page: 1
      })
      if (response.success) {
        // Map candidates để lấy id, name, position
        const mappedCandidates = (response.data || []).map(c => ({
          id: c.id,
          name: c.name || c.candidate_name || 'Ứng viên',
          position: c.position_applied || c.position || 'Chưa xác định',
          email: c.email || c.candidate_email
        }))
        setCandidates(mappedCandidates)
      }
    } catch (error) {
      console.error('Fetch candidates error:', error)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchInterviews()
    fetchStats()
    fetchCandidates()
  }, [fetchInterviews, fetchStats, fetchCandidates])

  // Reload when filters or page change
  useEffect(() => {
    fetchInterviews()
  }, [fetchInterviews])

  // Handlers
  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleResetFilters = () => {
    setFilters({ status: '', keyword: '', startDate: '', endDate: '' })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearch = (keyword) => {
    setFilters(prev => ({ ...prev, keyword }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(interviews.map(i => i.id))
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

  // Create
  const handleCreate = () => {
    setEditingInterview(null)
    setIsFormModalOpen(true)
  }

  // Edit
  const handleEdit = (interview) => {
    setEditingInterview(interview)
    setIsFormModalOpen(true)
  }

  // View
  const handleView = (interview) => {
    setSelectedInterview(interview)
    setIsDetailModalOpen(true)
  }

  // Submit (Create/Update)
  const handleSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      let response
      if (editingInterview) {
        // Cập nhật lịch
        response = await calendarApi.updateSchedule(editingInterview.id, {
          interviewDate: data.interviewDate,
          duration: data.duration,
          location: data.location,
          meetLink: data.meetLink,
          notes: data.notes
        })
        if (response.success) {
          toast.success(t('hr.interview.updateSuccess') || 'Cập nhật lịch thành công')
        }
      } else {
        // Tạo lịch mới
        response = await calendarApi.createSchedule(data)
        if (response.success) {
          toast.success(t('hr.interview.createSuccess') || 'Tạo lịch thành công')
        }
      }

      if (response.success) {
        setIsFormModalOpen(false)
        fetchInterviews()
        fetchStats()
      } else {
        toast.error(response.message || t('common.error') || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error(error.message || t('common.error') || 'Có lỗi xảy ra')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete single
  const handleDelete = async (id) => {
    try {
      const response = await calendarApi.deleteSchedule(id)
      if (response.success) {
        toast.success(t('hr.interview.deleteSuccess') || 'Xóa lịch thành công')
        fetchInterviews()
        fetchStats()
      } else {
        toast.error(response.message || t('common.error') || 'Không thể xóa lịch')
      }
    } catch (error) {
      toast.error(error.message || t('common.error') || 'Không thể xóa lịch')
    }
  }

  // Bulk delete
  const handleBulkDelete = async (ids) => {
    try {
      const response = await calendarApi.deleteBulkSchedules(ids)
      if (response.success) {
        toast.success(
          (t('hr.interview.deleteBulkSuccess') || 'Đã xóa {count} lịch phỏng vấn')
            .replace('{count}', ids.length)
        )
        setSelectedIds([])
        fetchInterviews()
        fetchStats()
      } else {
        toast.error(response.message || t('common.error') || 'Không thể xóa lịch')
      }
    } catch (error) {
      toast.error(error.message || t('common.error') || 'Không thể xóa lịch')
    }
  }

  // Confirm schedule
  const handleConfirm = async (id) => {
    try {
      const response = await calendarApi.confirmSchedule(id)
      if (response.success) {
        toast.success(t('hr.interview.confirmSuccess') || 'Xác nhận lịch thành công')
        fetchInterviews()
        fetchStats()
      } else {
        toast.error(response.message || t('common.error') || 'Không thể xác nhận lịch')
      }
    } catch (error) {
      toast.error(error.message || t('common.error') || 'Không thể xác nhận lịch')
    }
  }

  // Update status
  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await calendarApi.updateScheduleStatus(id, status)
      if (response.success) {
        toast.success(t('hr.interview.statusUpdateSuccess') || 'Cập nhật trạng thái thành công')
        fetchInterviews()
        fetchStats()
      } else {
        toast.error(response.message || t('common.error') || 'Không thể cập nhật trạng thái')
      }
    } catch (error) {
      toast.error(error.message || t('common.error') || 'Không thể cập nhật trạng thái')
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <InterviewHeader
        totalCount={pagination.total}
        todayCount={stats?.today || stats?.scheduled || 0}
        upcomingCount={(stats?.scheduled || 0) + (stats?.confirmed || 0)}
        onOpenCreateModal={handleCreate}
      />

      <InterviewStats stats={stats} />

      <InterviewFilters
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onSearch={handleSearch}
      />

      <InterviewTable
        interviews={interviews}
        pagination={pagination}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onConfirm={handleConfirm}
        onUpdateStatus={handleUpdateStatus}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        onBulkDelete={handleBulkDelete}
      />

      {/* Form Modal */}
      <InterviewFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSubmit}
        editingInterview={editingInterview}
        candidates={candidates}
        isSubmitting={isSubmitting}
      />

      {/* Detail Modal */}
      <InterviewDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        interview={selectedInterview}
        onConfirm={handleConfirm}
        onUpdateStatus={handleUpdateStatus}
      />
    </motion.div>
  )
}

export default Interviews