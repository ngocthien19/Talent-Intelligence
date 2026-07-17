import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { useNavigate } from 'react-router-dom' // THÊM IMPORT
import { applicationApi } from '~/api/candidate/application.api'
import {
  FaTimes,
  FaUpload,
  FaFilePdf,
  FaFileWord,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
  FaPaperPlane,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaFileAlt,
  FaTrashAlt
} from 'react-icons/fa'
import { toast } from 'react-toastify'

// Validation schema
const applySchema = yup.object({
  cv: yup
    .mixed()
    .required('Vui lòng chọn CV để ứng tuyển')
    .test('fileType', 'Vui lòng upload file PDF hoặc Word', (value) => {
      if (!value) return true
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      return validTypes.includes(value.type)
    })
    .test('fileSize', 'File quá lớn. Vui lòng chọn file dưới 10MB', (value) => {
      if (!value) return true
      return value.size <= 10 * 1024 * 1024
    }),
  coverLetter: yup
    .string()
    .max(2000, 'Thư giới thiệu không được vượt quá 2000 ký tự')
    .optional()
})

const ApplyJobModal = ({ isOpen, onClose, jobId, jobTitle, companyName }) => {
  const { t } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate() // THÊM
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    reset,
    trigger
  } = useForm({
    resolver: yupResolver(applySchema),
    mode: 'onChange',
    defaultValues: {
      cv: null,
      coverLetter: ''
    }
  })

  const cvFile = watch('cv')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setValue('cv', selectedFile, { shouldValidate: true })
      setFileName(selectedFile.name)
      trigger('cv')
    }
  }

  const handleRemoveFile = () => {
    setValue('cv', null, { shouldValidate: true })
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmit = async (data) => {
    if (!data.cv) {
      toast.warning('Vui lòng chọn CV để ứng tuyển')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('cv', data.cv)
      formData.append('job_id', jobId)
      formData.append('name', user?.fullname || '')
      formData.append('email', user?.email || '')
      formData.append('phone', user?.phone || '')
      formData.append('cover_letter', data.coverLetter || '')

      const response = await applicationApi.applyJob(formData)

      if (response.success) {
        toast.success('Ứng tuyển thành công!')
        reset()
        setFileName('')
        setUploadProgress(0)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        onClose()
        // CHUYỂN HƯỚNG ĐẾN TRANG APPLICATIONS
        navigate('/applications')
      }
    } catch (error) {
      toast.error(error?.message || 'Ứng tuyển thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      setFileName('')
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 rounded-t-2xl border-b border-brand-light dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-light/30 dark:bg-gray-700/30">
                <FaPaperPlane className="text-brand-primary dark:text-brand-primary" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
                  {t('jobs.applyNow') || 'Ứng tuyển ngay'}
                </h2>
                <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                  <FaBriefcase size={12} className="text-brand-text/40" />
                  {jobTitle} - {companyName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTimes size={20} className="text-brand-text/60 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Body */}
          <div className="p-6 space-y-6">
            {/* User Info Summary */}
            <div className="bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-brand-text dark:text-gray-400">
                <FaUser size={14} className="text-brand-text/40 dark:text-gray-500" />
                <span className="font-medium text-brand-secondary dark:text-white">{user?.fullname || 'Chưa cập nhật'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-text dark:text-gray-400">
                <FaEnvelope size={14} className="text-brand-text/40 dark:text-gray-500" />
                <span>{user?.email || 'Chưa cập nhật'}</span>
              </div>
              {user?.phone && (
                <div className="flex items-center gap-2 text-sm text-brand-text dark:text-gray-400">
                  <FaPhone size={14} className="text-brand-text/40 dark:text-gray-500" />
                  <span>{user?.phone}</span>
                </div>
              )}
            </div>

            {/* CV Upload */}
            <div>
              <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-2">
                <FaFileAlt size={14} className="inline mr-2 text-brand-text/40" />
                {t('jobs.cv') || 'CV của bạn'} <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                  cvFile
                    ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
                    : errors.cv
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-brand-light dark:border-gray-700 hover:border-brand-primary/50 dark:hover:border-brand-primary/50 hover:bg-brand-light/10 dark:hover:bg-gray-700/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isSubmitting}
                />

                {cvFile ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center gap-3"
                  >
                    <div className="p-3 rounded-xl bg-brand-light/30 dark:bg-gray-700/30">
                      {cvFile.type === 'application/pdf' ? (
                        <FaFilePdf size={32} className="text-red-500" />
                      ) : (
                        <FaFileWord size={32} className="text-blue-500" />
                      )}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-brand-secondary dark:text-white truncate max-w-[180px]">
                        {fileName}
                      </p>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {(cvFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      type="button"
                      disabled={isSubmitting}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Xóa file"
                    >
                      <FaTrashAlt size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-light/30 dark:bg-gray-700/30 flex items-center justify-center">
                      <FaUpload size={28} className="text-brand-text/40 dark:text-gray-500" />
                    </div>
                    <p className="text-sm text-brand-text dark:text-gray-400">
                      {t('jobs.dragDropCV') || 'Kéo thả hoặc click để chọn CV'}
                    </p>
                    <p className="text-xs text-brand-text/60 dark:text-gray-500">
                      {t('jobs.supportedFormats') || 'Hỗ trợ: PDF, DOC, DOCX (tối đa 10MB)'}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Error message */}
              <AnimatePresence>
                {errors.cv && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1.5"
                  >
                    <FaExclamationCircle size={14} className="flex-shrink-0" />
                    {errors.cv.message}
                  </motion.p>
                )}
              </AnimatePresence>

              {isSubmitting && uploadProgress > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
                    />
                  </div>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400 mt-1 text-right">
                    {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-2">
                <FaPaperPlane size={14} className="inline mr-2 text-brand-text/40" />
                {t('jobs.coverLetter') || 'Thư giới thiệu'}
                <span className="text-xs text-brand-text/60 dark:text-gray-400 ml-1">
                  ({t('jobs.optional') || 'tùy chọn'})
                </span>
              </label>
              <textarea
                {...register('coverLetter')}
                placeholder={t('jobs.coverLetterPlaceholder') || 'Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này...'}
                rows={4}
                disabled={isSubmitting}
                className={`w-full px-4 py-3 bg-brand-bg dark:bg-gray-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 resize-none ${
                  errors.coverLetter
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
              <AnimatePresence>
                {errors.coverLetter && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 text-sm text-red-500 flex items-center gap-1.5"
                  >
                    <FaExclamationCircle size={14} className="flex-shrink-0" />
                    {errors.coverLetter.message}
                  </motion.p>
                )}
              </AnimatePresence>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-brand-text/40 dark:text-gray-500">
                  {t('jobs.minChars') || 'Tối thiểu 0 ký tự'}
                </p>
                <p className="text-xs text-brand-text/40 dark:text-gray-500">
                  {watch('coverLetter')?.length || 0}/2000
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 rounded-b-2xl border-t border-brand-light dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                type="button"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-brand-light dark:border-gray-700 text-brand-text dark:text-gray-300 rounded-xl font-medium hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.cancel') || 'Hủy'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting || !isValid}
                className="flex-1 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" size={18} />
                    {t('common.submitting') || 'Đang gửi...'}
                  </>
                ) : (
                  <>
                    <FaPaperPlane size={18} />
                    {t('jobs.submitApplication') || 'Gửi ứng tuyển'}
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ApplyJobModal