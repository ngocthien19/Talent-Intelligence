// src/components/hr/interviews/InterviewFormModal.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaLink, FaUser, FaVideo, FaBuilding, FaChevronDown } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const pad = (n) => String(n).padStart(2, '0')

const toLocalDateParts = (d) => ({
  date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  time: `${pad(d.getHours())}:${pad(d.getMinutes())}`
})

// Lấy ngày mai
const getTomorrow = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return toLocalDateParts(tomorrow).date
}

// Lấy thời gian hiện tại + 1 giờ
const getNextHour = () => {
  const now = new Date()
  now.setHours(now.getHours() + 1)
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`
}

// Custom Dropdown component cho Candidate
const CandidateDropdown = ({ value, onChange, options, placeholder, className = '', disabled = false, error = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
  }

  const getDisplayLabel = () => {
    if (!value) return placeholder
    const option = options.find(opt => opt.value === value)
    return option ? option.label : placeholder
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer ${className} ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''} ${error ? 'border-red-500' : ''}`}
      >
        <span className="truncate flex-1 text-left flex items-center gap-2">
          <FaUser size={14} className="text-brand-text/40 dark:text-gray-500" />
          {getDisplayLabel()}
        </span>
        <FaChevronDown size={12} className={`text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer hover:bg-brand-light/30 dark:hover:bg-gray-800 ${
                  value === opt.value
                    ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                    : 'text-brand-text dark:text-gray-300 hover:text-brand-secondary dark:hover:text-white'
                }`}
              >
                <div className="flex flex-col">
                  <span>{opt.label}</span>
                  {opt.subLabel && (
                    <span className="text-xs text-brand-text/60 dark:text-gray-400">{opt.subLabel}</span>
                  )}
                </div>
                {value === opt.value && (
                  <span className="float-right text-brand-primary">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Custom Dropdown component cho Duration
const DurationDropdown = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { t } = useLanguage()

  const DURATION_OPTIONS = [
    { value: 15, label: '15 ' + (t('hr.interview.minutes') || 'phút') },
    { value: 30, label: '30 ' + (t('hr.interview.minutes') || 'phút') },
    { value: 45, label: '45 ' + (t('hr.interview.minutes') || 'phút') },
    { value: 60, label: '60 ' + (t('hr.interview.minutes') || 'phút') },
    { value: 90, label: '90 ' + (t('hr.interview.minutes') || 'phút') },
    { value: 120, label: '120 ' + (t('hr.interview.minutes') || 'phút') }
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (val) => {
    onChange(val)
    setIsOpen(false)
  }

  const getDisplayLabel = () => {
    const option = DURATION_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : '60 ' + (t('hr.interview.minutes') || 'phút')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer ${className}`}
      >
        <span className="truncate flex-1 text-left">
          <FaClock size={14} className="inline mr-2 text-brand-text/40 dark:text-gray-500" />
          {getDisplayLabel()}
        </span>
        <FaChevronDown size={12} className={`text-brand-text/40 dark:text-gray-500 flex-shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto"
          >
            {DURATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 cursor-pointer hover:bg-brand-light/30 dark:hover:bg-gray-800 ${
                  value === opt.value
                    ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 font-medium'
                    : 'text-brand-text dark:text-gray-300 hover:text-brand-secondary dark:hover:text-white'
                }`}
              >
                {opt.label}
                {value === opt.value && (
                  <span className="float-right text-brand-primary">✓</span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const InterviewFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingInterview,
  candidates = [],
  isSubmitting = false
}) => {
  const { t } = useLanguage()
  const [interviewType, setInterviewType] = useState('online')

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
      applicationId: '',
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
        const { date: localDate, time: localTime } = toLocalDateParts(date)

        const inferredType = editingInterview.meeting_link ? 'online' : 'offline'
        setInterviewType(inferredType)

        reset({
          applicationId: editingInterview.candidate_id || '',
          interviewDate: localDate,
          interviewTime: localTime,
          duration: editingInterview.duration || 60,
          location: editingInterview.location || '',
          meetLink: editingInterview.meeting_link || '',
          notes: editingInterview.notes || '',
          autoCreateCalendar: true
        })
      } else {
        const tomorrow = getTomorrow()
        const nextHour = getNextHour()
        setInterviewType('online')
        reset({
          applicationId: '',
          interviewDate: tomorrow,
          interviewTime: nextHour,
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

  const candidateOptions = candidates.map(c => ({
    value: c.id,
    label: c.name,
    subLabel: c.position_applied || c.position
  }))

  const onFormSubmit = (data) => {
    const interviewDateTime = new Date(`${data.interviewDate}T${data.interviewTime}`)

    const submitData = {
      applicationId: data.applicationId,
      interviewDate: interviewDateTime.toISOString(),
      duration: parseInt(data.duration),
      interviewType,
      location: interviewType === 'online' ? (data.location || 'Google Meet') : data.location?.trim(),
      meetLink: interviewType === 'online' ? (data.meetLink?.trim() || undefined) : undefined,
      notes: data.notes?.trim() || undefined,
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
              <input
                type="hidden"
                {...register('applicationId', {
                  required: t('hr.interview.validation.candidateRequired') || 'Vui lòng chọn ứng viên'
                })}
              />
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.candidate') || 'Ứng viên'} <span className="text-red-500">*</span>
                </label>
                <CandidateDropdown
                  value={watch('applicationId')}
                  onChange={(val) => {
                    setValue('applicationId', val, { shouldValidate: true })
                  }}
                  options={candidateOptions}
                  placeholder={t('hr.interview.selectCandidate') || 'Chọn ứng viên...'}
                  className={errors.applicationId ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'}
                  disabled={!!editingInterview}
                  error={!!errors.applicationId}
                />
                {errors.applicationId && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-1"
                  >
                    {errors.applicationId.message}
                  </motion.p>
                )}
                {editingInterview && (
                  <p className="text-xs text-brand-text/50 dark:text-gray-500 mt-1">
                    {t('hr.interview.candidateLocked') || 'Không thể thay đổi ứng viên khi chỉnh sửa lịch'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                    {t('hr.interview.date') || 'Ngày'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                    <input
                      {...register('interviewDate', {
                        required: t('hr.interview.validation.dateRequired') || 'Vui lòng chọn ngày',
                        validate: (value) => {
                          const now = new Date()
                          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                          const selectedDate = new Date(value)

                          if (selectedDate < today) {
                            return t('hr.interview.validation.datePast') || 'Ngày phỏng vấn không được nhỏ hơn ngày hiện tại'
                          }
                          return true
                        },
                        onChange: () => {
                          if (errors.interviewDate) clearErrors('interviewDate')
                        }
                      })}
                      type="date"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                        errors.interviewDate ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  {errors.interviewDate && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">
                      {errors.interviewDate.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                    {t('hr.interview.time') || 'Giờ'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                    <input
                      {...register('interviewTime', {
                        required: t('hr.interview.validation.timeRequired') || 'Vui lòng chọn giờ',
                        validate: (value, formValues) => {
                          const now = new Date()
                          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                          const selectedDate = new Date(formValues.interviewDate)

                          if (selectedDate.getTime() === today.getTime()) {
                            const [hours, minutes] = value.split(':').map(Number)
                            const selectedTime = new Date(now)
                            selectedTime.setHours(hours, minutes, 0, 0)

                            const minTime = new Date(now)
                            minTime.setHours(now.getHours() + 1, now.getMinutes(), 0, 0)

                            if (selectedTime < minTime) {
                              return t('hr.interview.validation.timePast') || `Giờ phỏng vấn phải sau ${pad(now.getHours() + 1)}:${pad(now.getMinutes())}`
                            }
                          }
                          return true
                        },
                        onChange: () => {
                          if (errors.interviewTime) clearErrors('interviewTime')
                        }
                      })}
                      type="time"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                        errors.interviewTime ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                      }`}
                    />
                  </div>
                  {errors.interviewTime && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">
                      {errors.interviewTime.message}
                    </motion.p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.duration') || 'Thời lượng (phút)'}
                </label>
                <DurationDropdown
                  value={watch('duration')}
                  onChange={(val) => setValue('duration', val)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-2">
                  {t('hr.interview.interviewType') || 'Hình thức phỏng vấn'}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewType('online')
                      clearErrors('location')
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                      interviewType === 'online'
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                        : 'border-brand-light/50 dark:border-gray-700 text-brand-text/60 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <FaVideo size={14} />
                    {t('hr.interview.online') || 'Online (Google Meet)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterviewType('offline')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 cursor-pointer ${
                      interviewType === 'offline'
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                        : 'border-brand-light/50 dark:border-gray-700 text-brand-text/60 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <FaBuilding size={14} />
                    {t('hr.interview.offline') || 'Trực tiếp'}
                  </button>
                </div>
              </div>

              <div className={interviewType === 'offline' ? '' : 'hidden'}>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.location') || 'Địa điểm'} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                  <input
                    {...register('location', {
                      validate: (value) => {
                        if (interviewType === 'offline' && !value?.trim()) {
                          return t('hr.interview.validation.locationRequired') || 'Vui lòng nhập địa điểm phỏng vấn trực tiếp'
                        }
                        return true
                      },
                      onChange: () => {
                        if (errors.location) clearErrors('location')
                      }
                    })}
                    type="text"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                      errors.location ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                    }`}
                    placeholder={t('hr.interview.locationOfflinePlaceholder') || 'Nhập địa chỉ phỏng vấn trực tiếp'}
                  />
                </div>
                {errors.location && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 mt-1">
                    {errors.location.message}
                  </motion.p>
                )}
              </div>

              <div className={interviewType === 'online' ? '' : 'hidden'}>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.interview.meetLink') || 'Link tham gia'}
                </label>
                <div className="relative">
                  <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
                  <input
                    {...register('meetLink')}
                    type="url"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    placeholder={t('hr.interview.meetLinkPlaceholder') || 'Để trống sẽ tự động tạo link Google Meet'}
                  />
                </div>
                <p className="text-xs text-brand-text/50 dark:text-gray-500 mt-1">
                  {t('hr.interview.meetLinkHint') || 'Để trống, hệ thống sẽ tự tạo link Google Meet'}
                </p>
              </div>

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

              <div className={`flex items-center gap-3 pt-2 ${interviewType === 'online' ? '' : 'hidden'}`}>
                <input
                  {...register('autoCreateCalendar')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                />
                <label className="text-sm font-medium text-brand-secondary dark:text-white">
                  {t('hr.interview.autoCreateCalendar') || 'Tự động tạo sự kiện Google Calendar'}
                </label>
              </div>

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