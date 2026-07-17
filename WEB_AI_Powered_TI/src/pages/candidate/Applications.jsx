import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaBriefcase,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaFileAlt,
  FaArrowLeft,
  FaEye,
  FaChevronRight,
  FaFilePdf,
  FaFileWord,
  FaFile,
  FaExternalLinkAlt
} from 'react-icons/fa'
import { applicationApi } from '~/api/candidate/application.api'
import { toast } from 'react-toastify'
import { useScrollToTop } from '~/hooks/useScrollToTop'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
}

const statusConfig = {
  pending: {
    icon: FaHourglassHalf,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    label: 'Đang chờ'
  },
  reviewing: {
    icon: FaClock,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Đang xem xét'
  },
  shortlisted: {
    icon: FaCheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Đã lọc'
  },
  rejected: {
    icon: FaTimesCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    label: 'Từ chối'
  },
  hired: {
    icon: FaCheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    label: 'Đã nhận'
  }
}

const getFileIcon = (mimeType) => {
  if (mimeType?.includes('pdf')) {
    return FaFilePdf
  }
  if (mimeType?.includes('word') || mimeType?.includes('document')) {
    return FaFileWord
  }
  return FaFile
}

const Applications = () => {
  useScrollToTop()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const response = await applicationApi.getApplications()
      if (response.success) {
        setApplications(response.data || [])
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể tải danh sách ứng tuyển')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${config.bg} ${config.color} border ${config.border} transition-all duration-200`}>
        <Icon size={14} />
        {config.label}
      </span>
    )
  }

  // Hàm mở CV trong tab mới
  const handleViewCV = (cvUrl, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (cvUrl) {
    // Sử dụng Google Docs Viewer để xem PDF
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}&embedded=true`
      window.open(viewerUrl, '_blank')
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="app-container py-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-12 text-center">
          <FaBriefcase size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-secondary dark:text-white mb-2">
            {t('applications.loginRequired') || 'Vui lòng đăng nhập'}
          </h2>
          <p className="text-brand-text dark:text-gray-400 mb-6">
            {t('applications.loginToView') || 'Đăng nhập để xem danh sách ứng tuyển của bạn'}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer"
          >
            {t('auth.login') || 'Đăng nhập'}
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="app-container py-6"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-secondary dark:text-white flex items-center gap-3 after:content-[''] after:hidden sm:after:inline-block after:w-16 md:after:w-24 after:h-[6px] after:bg-brand-primary/60 after:rounded-full">
            <motion.span
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <FaBriefcase size={24} className="text-brand-primary" />
            </motion.span>
            {t('applications.title') || 'Hồ sơ đã ứng tuyển'}
          </h1>
          <p className="text-brand-text dark:text-gray-400 text-sm mt-1">
            {t('applications.count') || 'Đã ứng tuyển'} <span className="font-semibold text-brand-primary">{applications.length}</span> {t('applications.jobs') || 'công việc'}
          </p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <FaArrowLeft size={14} />
          {t('applications.browseJobs') || 'Tìm việc ngay'}
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 skeleton-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : applications.length > 0 ? (
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app, index) => {
              const StatusIcon = statusConfig[app.status?.toLowerCase()]?.icon || FaHourglassHalf
              const FileIcon = getFileIcon(app.cv_mime_type)
              const cvFileName = app.cv_original_name || 'CV.pdf'
              const hasCV = app.cv_url && app.cv_url.trim() !== ''

              return (
                <motion.div
                  key={app.id}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -20 }}
                  layout
                  className="group bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 border-l-4 border-l-brand-primary hover:shadow-glow dark:hover:shadow-gray-800/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col h-full">
                    {/* Header row - Logo + Title + View Detail */}
                    <div className="flex items-start gap-4 mb-3">
                      {app.company_logo ? (
                        <img
                          src={app.company_logo?.secure_url || app.company_logo}
                          alt={app.company_name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                          {app.company_name?.charAt(0) || 'C'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-brand-secondary dark:text-white line-clamp-1">
                          {app.job_title || app.position_applied}
                        </h3>
                        <p className="text-sm text-brand-text dark:text-gray-400 flex items-center gap-1">
                          <FaBuilding size={12} />
                          <span className="line-clamp-1">{app.company_name}</span>
                        </p>
                        {app.job_location && (
                          <p className="text-sm text-brand-text/60 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                            <FaMapMarkerAlt size={12} />
                            <span className="line-clamp-1">{app.job_location}</span>
                          </p>
                        )}
                      </div>
                      {/* View Detail link - góc phải trên */}
                      <Link
                        to={`/applications/${app.id}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-white transition-all duration-300 group/link whitespace-nowrap flex-shrink-0 ml-auto mt-1"
                      >
                        <span className="flex items-center gap-1 group-hover/link:underline underline-offset-2 transition-all duration-300">
                          <FaEye size={14} />
                          {t('applications.viewDetail') || 'Xem chi tiết'}
                        </span>
                        <motion.span
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.3 }}
                          className="group-hover/link:translate-x-1 transition-transform duration-300"
                        >
                          <FaChevronRight size={12} />
                        </motion.span>
                      </Link>
                    </div>

                    {/* CV File - Hiển thị file đã gửi */}
                    <div className="mb-3">
                      {hasCV ? (
                        <button
                          onClick={(e) => handleViewCV(app.cv_url, e)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-brand-light/30 dark:bg-gray-700/30 hover:bg-brand-light/50 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 group/cv cursor-pointer border border-brand-light/30 dark:border-gray-600/30 hover:border-brand-primary/50 dark:hover:border-brand-primary/30"
                          title={t('applications.viewCV') || 'Xem CV trong tab mới'}
                        >
                          <FileIcon
                            size={16}
                            className={`${app.cv_mime_type?.includes('pdf') ? 'text-red-500' : app.cv_mime_type?.includes('word') ? 'text-blue-500' : 'text-brand-text/60'}`}
                          />
                          <span className="text-brand-text dark:text-gray-300 truncate max-w-[150px]">
                            {cvFileName}
                          </span>
                          {app.cv_file_size && (
                            <span className="text-xs text-brand-text/40 dark:text-gray-500">
                              {(app.cv_file_size / 1024).toFixed(1)} KB
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline transition-all duration-200 ml-1">
                            <FaExternalLinkAlt size={10} />
                            {t('applications.view') || 'Xem'}
                          </span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-brand-text/40 dark:text-gray-500 bg-brand-light/20 dark:bg-gray-700/20 rounded-lg">
                          <FaFile size={16} />
                          {t('applications.noCV') || 'Chưa có CV'}
                        </span>
                      )}
                    </div>

                    {/* Footer - Status + Date */}
                    <div className="flex flex-wrap items-center gap-3 mt-auto pt-3 border-t border-brand-light/50 dark:border-gray-700/50">
                      {getStatusBadge(app.status)}
                      <span className="text-xs text-brand-text/60 dark:text-gray-500 flex items-center gap-1">
                        <FaCalendarAlt size={12} />
                        {new Date(app.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-12 text-center"
        >
          <FaBriefcase size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
            {t('applications.empty') || 'Chưa có hồ sơ ứng tuyển nào'}
          </h3>
          <p className="text-brand-text dark:text-gray-400 mb-6">
            {t('applications.emptyDesc') || 'Bắt đầu tìm kiếm và ứng tuyển vào những công việc bạn quan tâm'}
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('applications.browseJobs') || 'Tìm việc ngay'}
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Applications