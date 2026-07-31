import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'
import { useSearchParams } from 'react-router-dom'
import { candidateNotificationApi } from '~/api/candidate/candidateNotification.api'
import { toast } from 'react-toastify'
import {
  FaBell,
  FaCheck,
  FaTrash,
  FaSpinner,
  FaChartBar,
  FaCalendarAlt,
  FaEnvelope,
  FaSync,
  FaFileAlt,
  FaUserPlus,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaInbox,
  FaBriefcase,
  FaMapMarkerAlt,
  FaPercentage,
  FaTags,
  FaBuilding,
  FaUser,
  FaHashtag,
  FaInfoCircle,
  FaThumbsUp
} from 'react-icons/fa'
import { formatDistanceToNow } from '~/utils/format'

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
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const FIELD_LABELS = {
  candidateId: 'Mã ứng viên',
  candidateName: 'Tên ứng viên',
  positionApplied: 'Vị trí ứng tuyển',
  position: 'Vị trí',
  overallScore: 'Điểm tổng quan',
  skillsMatchScore: 'Điểm kỹ năng',
  cultureFitScore: 'Điểm văn hóa',
  retentionScore: 'Điểm gắn bó',
  recommendation: 'Đề xuất',
  analysisId: 'Mã phân tích',
  applicationId: 'Mã đơn ứng tuyển',
  email: 'Email',
  sentAt: 'Thời gian gửi',
  jobId: 'Mã việc làm',
  jobTitle: 'Tên việc làm',
  companyName: 'Công ty',
  location: 'Địa điểm',
  employmentType: 'Loại hình',
  experienceLevel: 'Cấp bậc',
  requiredSkills: 'Kỹ năng yêu cầu',
  matchedSkills: 'Kỹ năng phù hợp',
  matchCount: 'Số kỹ năng khớp',
  totalRequired: 'Tổng kỹ năng yêu cầu',
  status: 'Trạng thái'
}

const FIELD_ICONS = {
  candidateId: { icon: FaHashtag, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  candidateName: { icon: FaUser, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  positionApplied: { icon: FaBriefcase, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  position: { icon: FaBriefcase, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  overallScore: { icon: FaPercentage, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  skillsMatchScore: { icon: FaPercentage, color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/30' },
  cultureFitScore: { icon: FaPercentage, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  retentionScore: { icon: FaPercentage, color: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-950/30' },
  recommendation: { icon: FaThumbsUp, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30' },
  analysisId: { icon: FaHashtag, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
  applicationId: { icon: FaHashtag, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
  email: { icon: FaEnvelope, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30' },
  sentAt: { icon: FaClock, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  jobId: { icon: FaHashtag, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
  jobTitle: { icon: FaBriefcase, color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/30' },
  companyName: { icon: FaBuilding, color: 'text-sky-500 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/30' },
  location: { icon: FaMapMarkerAlt, color: 'text-rose-500 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  employmentType: { icon: FaBriefcase, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  experienceLevel: { icon: FaChartBar, color: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-950/30' },
  requiredSkills: { icon: FaTags, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  matchedSkills: { icon: FaTags, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  matchCount: { icon: FaPercentage, color: 'text-lime-500 dark:text-lime-400', bg: 'bg-lime-50 dark:bg-lime-950/30' },
  totalRequired: { icon: FaPercentage, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  status: { icon: FaInfoCircle, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' }
}

const RECOMMENDATION_LABELS = {
  shortlist: { label: 'Đưa vào danh sách rút gọn', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' },
  reject: { label: 'Từ chối', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30' },
  need_more_info: { label: 'Cần thêm thông tin', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30' }
}

const formatFieldValue = (key, value) => {
  if (value === null || value === undefined || value === '') return null

  if (key === 'sentAt' && typeof value === 'string') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  return value
}

const isScoreField = (key) => ['overallScore', 'skillsMatchScore', 'cultureFitScore', 'retentionScore'].includes(key)

const getScoreColor = (score) => {
  if (score >= 80) return 'bg-emerald-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-amber-500'
  return 'bg-red-500'
}

const ExtraDataField = ({ fieldKey, value }) => {
  const label = FIELD_LABELS[fieldKey] || fieldKey
  const fieldConfig = FIELD_ICONS[fieldKey] || {
    icon: FaInfoCircle,
    color: 'text-gray-500 dark:text-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800'
  }
  const Icon = fieldConfig.icon
  const iconColor = fieldConfig.color
  const iconBg = fieldConfig.bg
  const formattedValue = formatFieldValue(fieldKey, value)

  if (formattedValue === null) return null

  if (Array.isArray(formattedValue)) {
    if (formattedValue.length === 0) return null
    return (
      <div className="flex items-start gap-3 py-2.5">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon size={13} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-text/50 dark:text-gray-500 mb-1.5">{label}</p>
          <div className="flex flex-wrap gap-1.5">
            {formattedValue.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-brand-light/50 dark:bg-gray-700 text-brand-secondary dark:text-gray-200 border border-brand-light dark:border-gray-600"
              >
                {String(item)}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isScoreField(fieldKey) && typeof formattedValue === 'number') {
    return (
      <div className="flex items-start gap-3 py-2.5">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon size={13} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-brand-text/50 dark:text-gray-500">{label}</p>
            <span className="text-sm font-bold text-brand-secondary dark:text-white">{formattedValue}/100</span>
          </div>
          <div className="w-full h-2 rounded-full bg-brand-light/50 dark:bg-gray-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreColor(formattedValue)}`}
              style={{ width: `${Math.min(100, Math.max(0, formattedValue))}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (fieldKey === 'recommendation' && RECOMMENDATION_LABELS[formattedValue]) {
    const rec = RECOMMENDATION_LABELS[formattedValue]
    return (
      <div className="flex items-start gap-3 py-2.5">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon size={13} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-text/50 dark:text-gray-500 mb-1">{label}</p>
          <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${rec.color}`}>
            {rec.label}
          </span>
        </div>
      </div>
    )
  }

  if (typeof formattedValue === 'object') {
    return (
      <div className="flex items-start gap-3 py-2.5">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon size={13} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-text/50 dark:text-gray-500 mb-1.5">{label}</p>
          <div className="space-y-1 bg-brand-light/20 dark:bg-gray-900/40 rounded-lg p-2.5">
            {Object.entries(formattedValue).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-brand-text/50 dark:text-gray-500">{FIELD_LABELS[k] || k}</span>
                <span className="font-medium text-brand-secondary dark:text-gray-200 truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon size={13} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-brand-text/50 dark:text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-brand-secondary dark:text-gray-200 break-words">
          {String(formattedValue)}
        </p>
      </div>
    </div>
  )
}

const CandidateNotifications = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [notifications, setNotifications] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false)
  const listRef = useRef(null)

  const notificationIdFromUrl = searchParams.get('id')

  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    if (page > 1) setIsLoadingMore(true)
    else setIsLoading(true)

    try {
      const response = await candidateNotificationApi.getNotifications({ limit: 20, page })
      if (response.success) {
        const data = response.data
        if (append) {
          setNotifications(prev => [...prev, ...data.notifications])
        } else {
          setNotifications(data.notifications || [])

          if (notificationIdFromUrl) {
            const target = data.notifications.find(n => n.id === notificationIdFromUrl)
            if (target) {
              setSelectedId(target.id)
              if (window.innerWidth < 768) {
                setIsMobileDetailOpen(true)
              }
            } else if (data.notifications?.length > 0 && !selectedId) {
              setSelectedId(data.notifications[0].id)
            }
          } else if (data.notifications?.length > 0 && !selectedId) {
            setSelectedId(data.notifications[0].id)
          }
        }
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 20,
          total: data.pagination?.total || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      toast.error('Không thể tải danh sách thông báo')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [selectedId, notificationIdFromUrl])

  useEffect(() => {
    fetchNotifications()
  }, [])

  useEffect(() => {
    if (notificationIdFromUrl) {
      fetchNotifications()
    }
  }, [notificationIdFromUrl])

  const handleSelect = (id) => {
    setSelectedId(id)
    setSearchParams({ id })
    if (window.innerWidth < 768) {
      setIsMobileDetailOpen(true)
    }
  }

  const handleBackToList = () => {
    setIsMobileDetailOpen(false)
    setSearchParams({})
  }

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      const response = await candidateNotificationApi.markAsRead(id)
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        )
      }
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const response = await candidateNotificationApi.markAllAsRead()
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
        )
      }
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả đã đọc')
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    try {
      const response = await candidateNotificationApi.deleteNotification(id)
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (selectedId === id) {
          const remaining = notifications.filter(n => n.id !== id)
          setSelectedId(remaining.length > 0 ? remaining[0].id : null)
          if (remaining.length === 0) {
            setIsMobileDetailOpen(false)
          }
        }
        toast.success('Xóa thông báo thành công')
      }
    } catch (error) {
      toast.error('Không thể xóa thông báo')
    }
  }

  const handleDeleteAll = async () => {
    try {
      const response = await candidateNotificationApi.deleteAll()
      if (response.success) {
        setNotifications([])
        setSelectedId(null)
        setIsMobileDetailOpen(false)
        toast.success('Xóa tất cả thông báo thành công')
      }
    } catch (error) {
      toast.error('Không thể xóa tất cả thông báo')
    }
  }

  const loadMore = async () => {
    if (pagination.page < Math.ceil(pagination.total / pagination.limit)) {
      await fetchNotifications(pagination.page + 1, true)
    }
  }

  const formatTime = (date) => {
    if (!date) return ''
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const getNotificationIcon = (type, size = 18) => {
    const iconClass = 'flex-shrink-0'

    switch (type) {
    case 'analysis_completed':
      return <FaChartBar size={size} className={`${iconClass} text-emerald-500 dark:text-emerald-400`} />
    case 'interview_invite':
      return <FaCalendarAlt size={size} className={`${iconClass} text-blue-500 dark:text-blue-400`} />
    case 'report_sent':
      return <FaEnvelope size={size} className={`${iconClass} text-purple-500 dark:text-purple-400`} />
    case 'status_update':
      return <FaSync size={size} className={`${iconClass} text-amber-500 dark:text-amber-400`} />
    case 'new_application':
      return <FaUserPlus size={size} className={`${iconClass} text-cyan-500 dark:text-cyan-400`} />
    case 'application_submitted':
      return <FaFileAlt size={size} className={`${iconClass} text-indigo-500 dark:text-indigo-400`} />
    case 'application_status_changed':
      return <FaSync size={size} className={`${iconClass} text-orange-500 dark:text-orange-400`} />
    case 'interview_scheduled':
      return <FaCalendarAlt size={size} className={`${iconClass} text-sky-500 dark:text-sky-400`} />
    case 'job_recommendation':
      return <FaCheckCircle size={size} className={`${iconClass} text-emerald-500 dark:text-emerald-400`} />
    case 'application_rejected':
      return <FaExclamationTriangle size={size} className={`${iconClass} text-red-500 dark:text-red-400`} />
    case 'new_job_opportunity':
      return <FaBriefcase size={size} className={`${iconClass} text-cyan-500 dark:text-cyan-400`} />
    case 'new_job_opportunity_matched':
      return <FaThumbsUp size={size} className={`${iconClass} text-emerald-500 dark:text-emerald-400`} />
    default:
      return <FaBell size={size} className={`${iconClass} text-brand-primary dark:text-brand-light`} />
    }
  }

  const getIconBgColor = (type) => {
    switch (type) {
    case 'analysis_completed':
      return 'bg-emerald-50 dark:bg-emerald-950/30'
    case 'interview_invite':
      return 'bg-blue-50 dark:bg-blue-950/30'
    case 'report_sent':
      return 'bg-purple-50 dark:bg-purple-950/30'
    case 'status_update':
      return 'bg-amber-50 dark:bg-amber-950/30'
    case 'new_application':
      return 'bg-cyan-50 dark:bg-cyan-950/30'
    case 'application_submitted':
      return 'bg-indigo-50 dark:bg-indigo-950/30'
    case 'application_status_changed':
      return 'bg-orange-50 dark:bg-orange-950/30'
    case 'interview_scheduled':
      return 'bg-sky-50 dark:bg-sky-950/30'
    case 'job_recommendation':
      return 'bg-emerald-50 dark:bg-emerald-950/30'
    case 'application_rejected':
      return 'bg-red-50 dark:bg-red-950/30'
    case 'new_job_opportunity':
      return 'bg-cyan-50 dark:bg-cyan-950/30'
    case 'new_job_opportunity_matched':
      return 'bg-emerald-50 dark:bg-emerald-950/30'
    default:
      return 'bg-brand-primary/10 dark:bg-brand-primary/20'
    }
  }

  const selectedNotification = notifications.find(n => n.id === selectedId)

  const extraDataEntries = selectedNotification?.data
    ? Object.entries(selectedNotification.data).filter(([, v]) => v !== null && v !== undefined && v !== '')
    : []

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className=""
    >
      <div className="app-container py-6 flex flex-col">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-4 pb-4 border-b border-brand-light/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <FaBell size={20} className="text-brand-primary" />
            <h1 className="text-xl font-bold text-brand-secondary dark:text-white">
              {t('candidate.notifications') || 'Thông báo'}
            </h1>
            <span className="text-xs font-medium px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-brand-text/60 dark:text-gray-400 rounded-full">
              {pagination.total} {t('common.notifications') || 'thông báo'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 text-xs font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-white transition-colors rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700 cursor-pointer"
              >
                {t('candidate.markAllRead') || 'Đọc tất cả'}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="px-3 py-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
              >
                {t('common.deleteAll') || 'Xóa tất cả'}
              </button>
            )}
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div
            className={`${
              isMobileDetailOpen ? 'hidden md:block' : 'block'
            } w-full min-w-0 md:w-[340px] lg:w-[400px] md:flex-shrink-0 md:sticky md:top-16 bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 border border-brand-light/40 dark:border-gray-700/50 overflow-hidden`}
          >
            <div
              ref={listRef}
              className="max-h-[calc(100vh-11rem)] overflow-y-auto p-3"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <FaSpinner className="animate-spin text-brand-primary" size={28} />
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-1.5">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0 }}
                      onClick={() => handleSelect(notification.id)}
                      className={`group p-3 rounded-xl transition-none cursor-pointer border ${
                        selectedId === notification.id
                          ? 'border-brand-primary bg-brand-primary/5 dark:bg-brand-primary/10 shadow-md'
                          : 'border-transparent hover:border-brand-light/50 dark:hover:border-gray-700 hover:bg-brand-light/20 dark:hover:bg-gray-800/50'
                      } ${!notification.is_read ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconBgColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm truncate ${
                              !notification.is_read
                                ? 'font-semibold text-brand-secondary dark:text-white'
                                : 'text-brand-text dark:text-gray-300'
                            }`}>
                              {notification.title}
                            </p>
                            {!notification.is_read && (
                              <span className="w-2 h-2 rounded-full bg-brand-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-brand-text/60 dark:text-gray-400 line-clamp-2 mt-0.5 break-words">
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <FaClock size={10} className="text-brand-text/30 dark:text-gray-500" />
                            <span className="text-[10px] text-brand-text/40 dark:text-gray-500">
                              {formatTime(notification.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {pagination.total > notifications.length && (
                    <button
                      onClick={loadMore}
                      disabled={isLoadingMore}
                      className="w-full py-2 text-center text-xs font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-white transition-none rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      {isLoadingMore ? (
                        <FaSpinner className="animate-spin mx-auto" size={16} />
                      ) : (
                        `${t('common.viewMore') || 'Xem thêm'} (${pagination.total - notifications.length} ${t('common.unread') || 'chưa đọc'})`
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-light/20 dark:bg-gray-700/30 flex items-center justify-center mb-3">
                    <FaInbox size={32} className="text-brand-light/60 dark:text-gray-600" />
                  </div>
                  <p className="font-medium text-brand-secondary dark:text-white">
                    {t('candidate.noNotifications') || 'Chưa có thông báo mới'}
                  </p>
                  <p className="text-xs text-brand-text/50 dark:text-gray-500 mt-1">
                    {t('candidate.checkLater') || 'Hãy quay lại sau để xem thông báo mới'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className={`${
              isMobileDetailOpen ? 'block' : 'hidden md:block'
            } flex-1 w-full min-w-0 bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 border border-brand-light/40 dark:border-gray-700/50 overflow-hidden`}
          >
            <div className="p-4 md:p-6">
              {isMobileDetailOpen && (
                <button
                  onClick={handleBackToList}
                  className="md:hidden flex items-center gap-2 text-sm text-brand-text/60 hover:text-brand-primary transition-colors mb-3 cursor-pointer"
                >
                  <FaArrowLeft size={14} />
                  {t('common.back') || 'Quay lại'}
                </button>
              )}

              <AnimatePresence mode="wait">
                {selectedNotification ? (
                  <motion.div
                    key={selectedNotification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-brand-light/30 dark:border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getIconBgColor(selectedNotification.type)}`}>
                          {getNotificationIcon(selectedNotification.type, 22)}
                        </div>
                        <div>
                          <h2 className={`text-lg font-bold ${
                            !selectedNotification.is_read
                              ? 'text-brand-secondary dark:text-white'
                              : 'text-brand-text dark:text-gray-300'
                          }`}>
                            {selectedNotification.title}
                          </h2>
                          {!selectedNotification.is_read && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                              {t('common.unread') || 'Chưa đọc'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!selectedNotification.is_read && (
                          <button
                            onClick={(e) => handleMarkAsRead(selectedNotification.id, e)}
                            className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-none hover:scale-110 cursor-pointer"
                            title={t('candidate.markAsRead') || 'Đánh dấu đã đọc'}
                          >
                            <FaCheck size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(selectedNotification.id, e)}
                          className="p-2 text-brand-text/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-none hover:scale-110 cursor-pointer"
                          title={t('common.delete') || 'Xóa'}
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-brand-light/20 dark:border-gray-700/30">
                        <p className="text-sm text-brand-text dark:text-gray-300 whitespace-pre-wrap leading-relaxed break-words">
                          {selectedNotification.content}
                        </p>
                      </div>

                      {extraDataEntries.length > 0 && (
                        <div className="rounded-xl border border-brand-light/30 dark:border-gray-700/40 overflow-hidden">
                          <div className="px-4 py-3 bg-brand-light/20 dark:bg-gray-900/40 border-b border-brand-light/30 dark:border-gray-700/40 flex items-center gap-2">
                            <FaInfoCircle size={13} className="text-brand-primary" />
                            <p className="text-xs font-semibold text-brand-secondary dark:text-gray-200 uppercase tracking-wide">
                              {t('common.additionalInfo') || 'Thông tin bổ sung'}
                            </p>
                          </div>
                          <div className="px-4 py-1 divide-y divide-brand-light/20 dark:divide-gray-700/30">
                            {extraDataEntries.map(([key, value]) => (
                              <ExtraDataField key={key} fieldKey={key} value={value} />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t border-brand-light/30 dark:border-gray-700/50">
                        <FaClock size={14} className="text-brand-text/30 dark:text-gray-500" />
                        <span className="text-xs text-brand-text/40 dark:text-gray-500">
                          {formatTime(selectedNotification.created_at)}
                        </span>
                        {selectedNotification.read_at && (
                          <>
                            <span className="w-px h-4 bg-brand-light/30 dark:bg-gray-700/50" />
                            <span className="text-xs text-brand-text/30 dark:text-gray-500">
                              {t('common.readAt') || 'Đã đọc'} {formatTime(selectedNotification.read_at)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-brand-light/20 dark:bg-gray-700/30 flex items-center justify-center mb-3">
                      <FaInbox size={32} className="text-brand-light/60 dark:text-gray-600" />
                    </div>
                    <p className="font-medium text-brand-secondary dark:text-white">
                      {t('candidate.selectNotification') || 'Chọn một thông báo để xem'}
                    </p>
                    <p className="text-xs text-brand-text/50 dark:text-gray-500 mt-1">
                      {t('candidate.clickNotificationToView') || 'Nhấn vào một thông báo bên trái để xem chi tiết'}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CandidateNotifications