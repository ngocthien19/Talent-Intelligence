import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FaBell,
  FaCheck,
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
  FaArrowRight,
  FaEye,
  FaBriefcase,
  FaThumbsUp
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { candidateNotificationApi } from '~/api/candidate/candidateNotification.api'
import useNotificationSocket from '~/hooks/useNotificationSocket'
import { toast } from 'react-toastify'
import { formatDistanceToNow } from '~/utils/format'

const CandidateNotificationDropdown = ({ onUnreadCountChange }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
  const dropdownRef = useRef(null)

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
        }
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 20,
          total: data.pagination?.total || 0
        })
        setUnreadCount(data.pagination?.unreadCount || 0)
        if (onUnreadCountChange) {
          onUnreadCountChange(data.pagination?.unreadCount || 0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [onUnreadCountChange])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await candidateNotificationApi.countUnread()
      if (response.success) {
        setUnreadCount(response.data?.unreadCount || 0)
        if (onUnreadCountChange) {
          onUnreadCountChange(response.data?.unreadCount || 0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }, [onUnreadCountChange])

  useEffect(() => {
    fetchUnreadCount()
  }, [fetchUnreadCount])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, false)
    }
  }, [isOpen, fetchNotifications])

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Real-time: nhận thông báo mới qua Socket.IO
  useNotificationSocket((newNotification) => {
    setNotifications(prev => [newNotification, ...prev])
    setUnreadCount(prev => {
      const next = prev + 1
      if (onUnreadCountChange) onUnreadCountChange(next)
      return next
    })
    toast.info(newNotification.title)
  })

  const handleMarkAsRead = async (id) => {
    try {
      const response = await candidateNotificationApi.markAsRead(id)
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        if (onUnreadCountChange) {
          onUnreadCountChange(Math.max(0, unreadCount - 1))
        }
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
        setUnreadCount(0)
        if (onUnreadCountChange) {
          onUnreadCountChange(0)
        }
      }
    } catch (error) {
      toast.error('Không thể đánh dấu tất cả đã đọc')
    }
  }

  // ĐÃ XÓA: handleDelete và handleDeleteAll

  const handleViewDetail = (notificationId) => {
    setIsOpen(false)
    navigate(`/notifications?id=${notificationId}`)
  }

  const handleViewAll = () => {
    setIsOpen(false)
    navigate('/notifications')
  }

  const formatTime = (date) => {
    if (!date) return ''
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const getNotificationIcon = (type) => {
    const iconClass = 'flex-shrink-0 transition-transform duration-300 group-hover:scale-110'
    const colorClass = 'group-hover:brightness-110'

    switch (type) {
    case 'analysis_completed':
      return <FaChartBar size={18} className={`${iconClass} text-emerald-500 dark:text-emerald-400 ${colorClass}`} />
    case 'interview_invite':
      return <FaCalendarAlt size={18} className={`${iconClass} text-blue-500 dark:text-blue-400 ${colorClass}`} />
    case 'report_sent':
      return <FaEnvelope size={18} className={`${iconClass} text-purple-500 dark:text-purple-400 ${colorClass}`} />
    case 'status_update':
      return <FaSync size={18} className={`${iconClass} text-amber-500 dark:text-amber-400 ${colorClass}`} />
    case 'new_application':
      return <FaUserPlus size={18} className={`${iconClass} text-cyan-500 dark:text-cyan-400 ${colorClass}`} />
    case 'application_submitted':
      return <FaFileAlt size={18} className={`${iconClass} text-indigo-500 dark:text-indigo-400 ${colorClass}`} />
    case 'application_status_changed':
      return <FaSync size={18} className={`${iconClass} text-orange-500 dark:text-orange-400 ${colorClass}`} />
    case 'interview_scheduled':
      return <FaCalendarAlt size={18} className={`${iconClass} text-sky-500 dark:text-sky-400 ${colorClass}`} />
    case 'job_recommendation':
      return <FaCheckCircle size={18} className={`${iconClass} text-emerald-500 dark:text-emerald-400 ${colorClass}`} />
    case 'application_rejected':
      return <FaExclamationTriangle size={18} className={`${iconClass} text-red-500 dark:text-red-400 ${colorClass}`} />
    case 'new_job_opportunity':
      return <FaBriefcase size={18} className={`${iconClass} text-cyan-500 dark:text-cyan-400 ${colorClass}`} />
    case 'new_job_opportunity_matched':
      return <FaThumbsUp size={18} className={`${iconClass} text-emerald-500 dark:text-emerald-400 ${colorClass}`} />
    default:
      return <FaBell size={18} className={`${iconClass} text-brand-primary dark:text-brand-light ${colorClass}`} />
    }
  }

  const getIconBgColor = (type) => {
    switch (type) {
    case 'analysis_completed':
      return 'bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'
    case 'interview_invite':
      return 'bg-blue-50 dark:bg-blue-950/30 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40'
    case 'report_sent':
      return 'bg-purple-50 dark:bg-purple-950/30 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40'
    case 'status_update':
      return 'bg-amber-50 dark:bg-amber-950/30 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/40'
    case 'new_application':
      return 'bg-cyan-50 dark:bg-cyan-950/30 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/40'
    case 'application_submitted':
      return 'bg-indigo-50 dark:bg-indigo-950/30 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40'
    case 'application_status_changed':
      return 'bg-orange-50 dark:bg-orange-950/30 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40'
    case 'interview_scheduled':
      return 'bg-sky-50 dark:bg-sky-950/30 group-hover:bg-sky-100 dark:group-hover:bg-sky-900/40'
    case 'job_recommendation':
      return 'bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'
    case 'application_rejected':
      return 'bg-red-50 dark:bg-red-950/30 group-hover:bg-red-100 dark:group-hover:bg-red-900/40'
    case 'new_job_opportunity':
      return 'bg-cyan-50 dark:bg-cyan-950/30 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/40'
    case 'new_job_opportunity_matched':
      return 'bg-emerald-50 dark:bg-emerald-950/30 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'
    default:
      return 'bg-brand-primary/10 dark:bg-brand-primary/20 group-hover:bg-brand-primary/20 dark:group-hover:bg-brand-primary/30'
    }
  }

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 sm:p-2 rounded-full hover:bg-brand-light/50 dark:hover:bg-gray-800 transition-all duration-300 focus:outline-none group cursor-pointer"
        aria-label={t('candidate.notifications') || 'Thông báo'}
        aria-expanded={isOpen}
      >
        <FaBell
          size={18}
          className={`transition-all duration-300 ${
            isOpen
              ? 'text-brand-primary scale-110'
              : 'text-brand-text dark:text-gray-300 group-hover:text-brand-primary group-hover:scale-110'
          }`}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay chỉ hiện trên mobile để bấm ra ngoài đóng dropdown + tránh scroll nền */}
            <div
              className="fixed inset-0 z-40 sm:hidden"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-3 right-3 top-[68px] max-h-[80vh]
                sm:absolute sm:left-auto sm:top-auto sm:right-[-8px] sm:mt-2
                w-auto sm:w-[400px] sm:max-w-[400px] max-w-none
                bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-brand-light/50 dark:border-gray-700 overflow-hidden z-50"
            >
              <div className="px-3 sm:px-4 py-3 border-b border-brand-light/50 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <h4 className="font-semibold text-sm text-brand-secondary dark:text-white flex items-center gap-2">
                  <FaBell size={14} className="text-brand-primary" />
                  {t('candidate.notifications') || 'Thông báo'}
                  {unreadCount > 0 && (
                    <span className="text-xs font-medium px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                      {unreadCount} {t('common.unread') || 'chưa đọc'}
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {t('candidate.markAllRead') || 'Đọc tất cả'}
                    </button>
                  )}
                  {/* ĐÃ XÓA NÚT XÓA TẤT CẢ */}
                </div>
              </div>

              <div className="max-h-[calc(80vh-120px)] sm:max-h-[440px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <FaSpinner className="animate-spin text-brand-primary" size={28} />
                  </div>
                ) : notifications.length > 0 ? (
                  <ul className="py-1">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className={`group px-3 sm:px-4 py-3 sm:py-4 hover:bg-brand-light/30 dark:hover:bg-gray-800 transition-all duration-200 border-b border-brand-light/20 dark:border-gray-700/50 last:border-0 ${
                          !notification.is_read ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${getIconBgColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-1 sm:gap-2">
                              <p className={`text-xs sm:text-sm transition-colors duration-200 ${
                                !notification.is_read
                                  ? 'font-semibold text-brand-secondary dark:text-white'
                                  : 'text-brand-text dark:text-gray-300 group-hover:text-brand-secondary dark:group-hover:text-white'
                              }`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                                {!notification.is_read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-1 sm:p-1.5 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                                    title={t('candidate.markAsRead') || 'Đánh dấu đã đọc'}
                                  >
                                    <FaCheck size={10} sm:size={12} />
                                  </button>
                                )}
                                {/* ĐÃ XÓA NÚT XÓA Ở ĐÂY */}
                              </div>
                            </div>
                            <p className="text-xs text-brand-text/60 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed group-hover:text-brand-text/80 dark:group-hover:text-gray-300 transition-colors duration-200">
                              {notification.content}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                              <div className="flex items-center gap-1">
                                <FaClock size={9} sm:size={10} className="text-brand-text/30 dark:text-gray-500" />
                                <span className="text-[9px] sm:text-[10px] text-brand-text/40 dark:text-gray-500">
                                  {formatTime(notification.created_at)}
                                </span>
                                {!notification.is_read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                                )}
                              </div>
                              <button
                                onClick={() => handleViewDetail(notification.id)}
                                className="flex items-center gap-1 text-[9px] sm:text-[10px] font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-white transition-all duration-200 group/link hover:gap-1.5 cursor-pointer"
                              >
                                <span className="hover:underline underline-offset-2 transition-all duration-200">
                                  {t('common.viewDetail') || 'Xem chi tiết'}
                                </span>
                                <FaArrowRight size={8} sm:size={10} className="transition-transform duration-200 group-hover/link:translate-x-0.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-12 text-center text-brand-text/70 dark:text-gray-400 text-sm flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-brand-light/20 dark:bg-gray-700/30 flex items-center justify-center transition-all duration-300 hover:scale-110">
                      <FaBell className="text-brand-light/60 dark:text-gray-600" size={28} />
                    </div>
                    <div>
                      <p className="font-medium text-brand-secondary dark:text-white">
                        {t('candidate.noNotifications') || 'Chưa có thông báo mới'}
                      </p>
                      <p className="text-xs text-brand-text/50 dark:text-gray-500 mt-0.5">
                        {t('candidate.checkLater') || 'Hãy quay lại sau để xem thông báo mới'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-brand-light/50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                {notifications.length > 0 && pagination.total > notifications.length ? (
                  <div className="flex flex-col gap-1.5 sm:gap-2">
                    <button
                      onClick={() => fetchNotifications(pagination.page + 1, true)}
                      disabled={isLoadingMore}
                      className="w-full text-center text-xs font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-white transition-all duration-200 py-1.5 flex items-center justify-center gap-2 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 group cursor-pointer"
                    >
                      {isLoadingMore ? (
                        <>
                          <FaSpinner className="animate-spin" size={12} sm:size={14} />
                          {t('common.loading') || 'Đang tải...'}
                        </>
                      ) : (
                        <>
                          {t('common.viewMore') || 'Xem thêm'}
                          <span className="text-brand-text/40 dark:text-gray-500 group-hover:text-brand-primary dark:group-hover:text-white transition-colors duration-200">
                            ({pagination.total - notifications.length} {t('common.unread') || 'chưa đọc'})
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleViewAll}
                      className="w-full text-center text-xs font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-all duration-200 py-1.5 flex items-center justify-center gap-1.5 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 group cursor-pointer"
                    >
                      <FaEye size={11} sm:size={12} className="group-hover:scale-110 transition-transform duration-200" />
                      {t('candidate.viewAllNotifications') || 'Xem tất cả thông báo'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleViewAll}
                    className="w-full text-center text-xs font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-all duration-200 py-1.5 flex items-center justify-center gap-1.5 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 group cursor-pointer"
                  >
                    <FaEye size={11} sm:size={12} className="group-hover:scale-110 transition-transform duration-200" />
                    {t('candidate.viewAllNotifications') || 'Xem tất cả thông báo'}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CandidateNotificationDropdown