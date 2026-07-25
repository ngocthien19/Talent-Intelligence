import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaLink,
  FaBriefcase,
  FaFileAlt,
  FaTimesCircle,
  FaCheckCircle,
  FaGoogle,
  FaSpinner
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { calendarApi } from '~/api/hr/calendar.api'
import InterviewStatusBadge from './InterviewStatusBadge'
import { formatDate } from '~/utils/format'

const InterviewDetailModal = ({ isOpen, onClose, interview, onUpdateStatus }) => {
  const { t } = useLanguage()
  const [calendarLink, setCalendarLink] = useState(null)
  const [isLoadingLink, setIsLoadingLink] = useState(false)

  useEffect(() => {
    if (isOpen && interview?.id) {
      fetchCalendarLink()
    }
  }, [isOpen, interview?.id])

  if (!isOpen || !interview) return null

  const interviewDate = new Date(interview.interview_date)
  const avatarUrl = interview?.avatar?.secure_url || null

  const fetchCalendarLink = async () => {
    if (!interview.google_event_id) return

    setIsLoadingLink(true)
    try {
      const response = await calendarApi.getCalendarLink(interview.id)
      if (response.success) {
        setCalendarLink(response.data)
      }
    } catch (error) {
      // console.error('Error fetching calendar link:', error)
    } finally {
      setIsLoadingLink(false)
    }
  }

  const DetailItem = ({ icon: Icon, label, value, className = '' }) => (
    <div className={`flex items-start gap-3 py-2 ${className}`}>
      <Icon size={16} className="text-brand-primary/60 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-brand-text/60 dark:text-gray-400">{label}</p>
        <p className="text-sm text-brand-secondary dark:text-white">{value || '--'}</p>
      </div>
    </div>
  )

  const handleCancel = () => {
    if (onUpdateStatus) onUpdateStatus(interview.id, 'cancelled')
    onClose()
  }

  const handleComplete = () => {
    if (onUpdateStatus) onUpdateStatus(interview.id, 'completed')
    onClose()
  }

  const canCancel = interview.status === 'scheduled'
  const canComplete = interview.status === 'confirmed'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-light/50 dark:border-gray-700">
              <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
                {t('hr.interview.detailTitle') || 'Chi tiết lịch phỏng vấn'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-brand-light/30 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <FaTimes size={18} className="text-brand-text/60 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-brand-secondary dark:text-white">
                    {interview.position_applied || '--'}
                  </p>
                  <p className="text-sm text-brand-text/60 dark:text-gray-400">
                    {t('hr.interview.interviewWith') || 'Phỏng vấn với'}{' '}
                    <span className="font-medium text-brand-secondary dark:text-white">
                      {interview.candidate_name}
                    </span>
                  </p>
                </div>
                <InterviewStatusBadge status={interview.status} />
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                    {t('hr.interview.candidateInfo') || 'Thông tin ứng viên'}
                  </p>
                  <div className="flex items-center gap-2">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={interview.candidate_name || 'Avatar'}
                        className="w-10 h-10 rounded-full object-cover border-2 border-brand-light/30 dark:border-gray-700 flex-shrink-0"
                      />
                    ) : null}
                    <div className={`w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${avatarUrl ? 'hidden' : ''}`}>
                      {interview.candidate_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-brand-secondary dark:text-white">
                        {interview.candidate_name}
                      </p>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {interview.candidate_email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                    {t('hr.interview.interviewInfo') || 'Thông tin phỏng vấn'}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm text-brand-secondary dark:text-white">
                      <FaCalendarAlt className="inline mr-1.5 text-brand-primary/60" size={12} />
                      {formatDate(interviewDate)}
                    </p>
                    <p className="text-sm text-brand-secondary dark:text-white">
                      <FaClock className="inline mr-1.5 text-brand-primary/60" size={12} />
                      {interviewDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      {interview.duration && ` (${interview.duration} phút)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.interview.details') || 'Chi tiết'}
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <DetailItem
                    icon={FaBriefcase}
                    label={t('hr.interview.position') || 'Vị trí'}
                    value={interview.position_applied || '--'}
                  />
                  <DetailItem
                    icon={FaMapMarkerAlt}
                    label={t('hr.interview.location') || 'Địa điểm'}
                    value={interview.location || 'Google Meet'}
                  />
                  <DetailItem
                    icon={FaEnvelope}
                    label={t('hr.interview.email') || 'Email'}
                    value={interview.candidate_email || '--'}
                  />
                  {interview.candidate_phone && (
                    <DetailItem
                      icon={FaPhone}
                      label={t('hr.interview.phone') || 'Số điện thoại'}
                      value={interview.candidate_phone}
                    />
                  )}
                  {interview.meeting_link && (
                    <DetailItem
                      icon={FaLink}
                      label={t('hr.interview.meetLink') || 'Link tham gia'}
                      value={
                        <a
                          href={interview.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-primary hover:underline break-all"
                        >
                          {interview.meeting_link}
                        </a>
                      }
                    />
                  )}
                  {calendarLink?.hasCalendarEvent && (
                    <DetailItem
                      icon={FaGoogle}
                      label={t('hr.interview.calendarLink') || 'Google Calendar'}
                      value={
                        isLoadingLink ? (
                          <FaSpinner className="animate-spin text-brand-primary" size={14} />
                        ) : (
                          <a
                            href={calendarLink.calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-primary hover:underline break-all flex items-center gap-1"
                          >
                            <FaGoogle size={14} />
                            {t('hr.interview.viewCalendar') || 'Xem trên Google Calendar'}
                          </a>
                        )
                      }
                    />
                  )}
                  <DetailItem
                    icon={FaFileAlt}
                    label={t('hr.interview.notes') || 'Ghi chú'}
                    value={interview.notes || t('hr.interview.noNotes') || 'Không có ghi chú'}
                  />
                </div>
              </div>

              {/* Actions */}
              {(canCancel || canComplete) && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-light/50 dark:border-gray-700">
                  {canCancel && (
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <FaTimesCircle className="inline mr-2" size={14} />
                      {t('hr.interview.cancelSchedule') || 'Hủy lịch'}
                    </button>
                  )}
                  {canComplete && (
                    <button
                      onClick={handleComplete}
                      className="px-4 py-2 text-sm font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <FaCheckCircle className="inline mr-2" size={14} />
                      {t('hr.interview.markComplete') || 'Đánh dấu hoàn thành'}
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    {t('common.close') || 'Đóng'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default InterviewDetailModal