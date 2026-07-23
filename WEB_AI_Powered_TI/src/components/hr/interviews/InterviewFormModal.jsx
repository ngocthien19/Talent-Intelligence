import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink, FaUser } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const InterviewFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingInterview,
  candidates = [],
  isSubmitting = false
}) => {
  const { t } = useLanguage()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    clearErrors
  } = useForm({
    defaultValues: {
      candidateId: '',
      interviewDate: '',
      interviewTime: '09:00',
      duration: 60,
      location: '',
      meetLink: '',
      notes: '',
      autoCreateCalendar: true
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (editingInterview) {
        const date = new Date(editingInterview.interview_date)
        reset({
          candidateId: editingInterview.candidate_id || '',
          interviewDate: date.toISOString().split('T')[0],
          interviewTime: date.toTimeString().slice(0, 5),
          duration: editingInterview.duration || 60,
          location: editingInterview.location || '',
          meetLink: editingInterview.meeting_link || '',
          notes: editingInterview.notes || '',
          autoCreateCalendar: true
        })
      } else {
        reset({
          candidateId: '',
          interviewDate: new Date().toISOString().split('T')[0],
          interviewTime: '09:00',
          duration: 60,
          location: '',
          meetLink: '',
          notes: '',
          autoCreateCalendar: true
        })
      }
      clearErrors()
    }
  }, [isOpen, editingInterview, reset, clearErrors])

  const onFormSubmit = (data) => {
    const interviewDateTime = new Date(`${data.interviewDate}T${data.interviewTime}`)
    if (isNaN(interviewDateTime.getTime())) {
      return
    }

    const submitData = {
      candidateId: data.candidateId,
      interviewDate: interviewDateTime.toISOString(),
      duration: data.duration,
      location: data.location || 'Google Meet',
      meetLink: data.meetLink || undefined,
      notes: data.notes || undefined,
      autoCreateCalendar: data.autoCreateCalendar
    }

    onSubmit(submitData)
  }

  if (!isOpen) return null

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
                {editingInterview
                  ? t('hr.interview.editTitle') || 'Chỉnh sửa lịch phỏng vấn'
                  : t('hr.interview.scheduleTitle') || 'Tạo lịch phỏng vấn mới'
                }
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-brand-light/30 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <FaTimes size={18} className="text-brand-text/60 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
              {/* Candidate */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.candidate') || 'Ứng viên'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                  <select
                    {...register('candidateId', {
                      required: t('hr.interview.validation.candidateRequired') || 'Vui lòng chọn ứng viên'
                    })}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                      errors.candidateId ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                    }`}
                  >
                    <option value="">{t('hr.interview.selectCandidate') || 'Chọn ứng viên...'}</option>
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.position_applied || candidate.position}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.candidateId && <p className="text-xs text-red-500 mt-1">{errors.candidateId.message}</p>}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                    {t('hr.interview.date') || 'Ngày'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                    <input
                      {...register('interviewDate', {
                        required: t('hr.interview.validation.dateRequired') || 'Vui lòng chọn ngày'
                      })}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                        errors.interviewDate ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  {errors.interviewDate && <p className="text-xs text-red-500 mt-1">{errors.interviewDate.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                    {t('hr.interview.time') || 'Giờ'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                    <input
                      {...register('interviewTime', {
                        required: t('hr.interview.validation.timeRequired') || 'Vui lòng chọn giờ'
                      })}
                      type="time"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                        errors.interviewTime ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  {errors.interviewTime && <p className="text-xs text-red-500 mt-1">{errors.interviewTime.message}</p>}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.duration') || 'Thời lượng (phút)'}
                </label>
                <select
                  {...register('duration')}
                  className="w-full px-4 py-2.5 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                >
                  <option value="15">15 phút</option>
                  <option value="30">30 phút</option>
                  <option value="45">45 phút</option>
                  <option value="60">60 phút</option>
                  <option value="90">90 phút</option>
                  <option value="120">120 phút</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.location') || 'Địa điểm'}
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    placeholder={t('hr.interview.locationPlaceholder') || 'Nhập địa điểm hoặc để trống (Google Meet)'}
                  />
                </div>
              </div>

              {/* Meet Link */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.meetLink') || 'Link tham gia'}
                </label>
                <div className="relative">
                  <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                  <input
                    {...register('meetLink')}
                    type="url"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    placeholder={t('hr.interview.meetLinkPlaceholder') || 'https://meet.google.com/xxx-xxxx-xxx'}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.notes') || 'Ghi chú'}
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                  placeholder={t('hr.interview.notesPlaceholder') || 'Nhập ghi chú cho buổi phỏng vấn...'}
                />
              </div>

              {/* Auto create calendar */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  {...register('autoCreateCalendar')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                />
                <label className="text-sm font-medium text-brand-secondary dark:text-white">
                  {t('hr.interview.autoCreateCalendar') || 'Tự động tạo sự kiện Google Calendar'}
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-brand-light/50 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  {t('common.cancel') || 'Hủy'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('common.loading') || 'Đang xử lý...'}
                    </span>
                  ) : (
                    editingInterview
                      ? t('hr.interview.update') || 'Cập nhật'
                      : t('hr.interview.schedule') || 'Tạo lịch'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default InterviewFormModal