import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  FaArrowLeft,
  FaBuilding,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFilePdf,
  FaFileWord,
  FaFile,
  FaExternalLinkAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaBriefcase,
  FaFileAlt
} from 'react-icons/fa'
import { applicationApi } from '~/api/candidate/application.api'
import { toast } from 'react-toastify'
import { useScrollToTop } from '~/hooks/useScrollToTop'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const fadeUp = {
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

const ApplicationDetail = () => {
  useScrollToTop()
  const { id } = useParams()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [application, setApplication] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchApplicationDetail()
  }, [id, isAuthenticated])

  const fetchApplicationDetail = async () => {
    setIsLoading(true)
    try {
      const response = await applicationApi.getApplicationDetail(id)
      if (response.success) {
        setApplication(response.data)
      } else {
        toast.error(response.message || 'Không thể tải chi tiết ứng tuyển')
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể tải chi tiết ứng tuyển')
    } finally {
      setIsLoading(false)
    }
  }

  // Hàm xem CV với Google Docs Viewer
  const handleViewCV = (cvUrl) => {
    if (cvUrl) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}&embedded=true`
      window.open(viewerUrl, '_blank')
    }
  }

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${config.bg} ${config.color} border ${config.border} transition-all duration-200`}>
        <Icon size={16} />
        {config.label}
      </span>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <div className="app-container py-6 animate-pulse">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="app-container py-6">
        <div className="max-w-4xl mx-auto text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-custom">
          <FaBriefcase size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-secondary dark:text-white mb-2">
            Không tìm thấy hồ sơ ứng tuyển
          </h2>
          <Link
            to="/applications"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300"
          >
            <FaArrowLeft size={16} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  const FileIcon = getFileIcon(application.cv_mime_type)
  const hasCV = application.cv_url && application.cv_url.trim() !== ''

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="app-container py-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Main Card */}
        <motion.div
          variants={slideLeft}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 overflow-hidden"
        >
          {/* Header with gradient line */}
          <div className="h-1 w-full bg-gradient-to-r from-brand-primary to-brand-accent" />

          <div className="p-6 md:p-8">
            {/* Header Row: Title + Back Button */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-brand-light/50 dark:border-gray-700/50"
            >
              {/* Title - bên trái */}
              <div className="flex items-center gap-3">
                <FaFileAlt size={20} className="text-brand-primary" />
                <h2 className="text-lg font-bold text-brand-secondary dark:text-white">
                  {t('applications.detailTitle') || 'Xem chi tiết hồ sơ'}
                </h2>
              </div>

              {/* Back button - bên phải */}
              <button
                onClick={() => navigate('/applications')}
                className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-all duration-200 cursor-pointer group flex-shrink-0"
              >
                <FaArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="group-hover:underline underline-offset-2 transition-all duration-200">
                  {t('applications.back') || 'Quay lại'}
                </span>
              </button>
            </motion.div>

            {/* Job Info + Status - cùng hàng */}
            <motion.div
              variants={slideRight}
              className="flex flex-wrap items-start justify-between gap-4 mb-6"
            >
              {/* Left: Logo + Job Info */}
              <div className="flex items-start gap-4">
                {application.company_logo ? (
                  <img
                    src={application.company_logo?.secure_url || application.company_logo}
                    alt={application.company_name}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    {application.company_name?.charAt(0) || 'C'}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-extrabold text-brand-secondary dark:text-white">
                    {application.job_title || application.position}
                  </h1>
                  <p className="text-brand-text dark:text-gray-400 flex items-center gap-1">
                    <FaBuilding size={14} />
                    {application.company_name}
                  </p>
                  {application.job_location && (
                    <p className="text-sm text-brand-text/60 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <FaMapMarkerAlt size={12} />
                      {application.job_location}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Status Badge */}
              <div className="flex-shrink-0">
                {getStatusBadge(application.status)}
              </div>
            </motion.div>

            {/* Candidate Info - SỬA: dùng candidate_name và candidate_email */}
            <motion.div
              variants={slideLeft}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl"
            >
              <div className="flex items-center gap-3 text-sm">
                <FaUser size={16} className="text-brand-text/40 dark:text-gray-500" />
                <span className="text-brand-text dark:text-gray-300">
                  {application.candidate_name || application.name || 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <FaEnvelope size={16} className="text-brand-text/40 dark:text-gray-500" />
                <span className="text-brand-text dark:text-gray-300">
                  {application.candidate_email || application.email || 'Chưa cập nhật'}
                </span>
              </div>
              {application.candidate_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <FaPhone size={16} className="text-brand-text/40 dark:text-gray-500" />
                  <span className="text-brand-text dark:text-gray-300">
                    {application.candidate_phone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <FaCalendarAlt size={16} className="text-brand-text/40 dark:text-gray-500" />
                <span className="text-brand-text dark:text-gray-300">
                  {new Date(application.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </motion.div>

            {/* CV Section */}
            <motion.div
              variants={slideRight}
              className="mb-6"
            >
              <h3 className="text-sm font-medium text-brand-secondary dark:text-white mb-3 flex items-center gap-2">
                <FaFileAlt size={16} />
                {t('applications.cv') || 'CV đã gửi'}
              </h3>
              {hasCV ? (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-brand-light/20 dark:bg-gray-700/30 rounded-xl border border-brand-light/30 dark:border-gray-700/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileIcon
                      size={24}
                      className={`${application.cv_mime_type?.includes('pdf') ? 'text-red-500' : application.cv_mime_type?.includes('word') ? 'text-blue-500' : 'text-brand-text/60'}`}
                    />
                    <div className="min-w-0">{t('applications.coverLetter') || 'Thư giới thiệu'}
                      <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
                        {application.cv_original_name || 'CV.pdf'}
                      </p>
                      {application.cv_file_size && (
                        <p className="text-xs text-brand-text/60 dark:text-gray-400">
                          {(application.cv_file_size / 1024).toFixed(1)} KB
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleViewCV(application.cv_url)}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <FaExternalLinkAlt size={14} />
                      {t('applications.view') || 'Xem CV'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-brand-light/20 dark:bg-gray-700/30 rounded-xl border border-brand-light/30 dark:border-gray-700/50 text-center">
                  <p className="text-brand-text/60 dark:text-gray-400">
                    {t('applications.noCV') || 'Chưa có CV'}
                  </p>
                </div>
              )}
            </motion.div>

            {/* Cover Letter */}
            {application.cover_letter_text && (
              <motion.div
                variants={slideLeft}
                className="mb-6"
              >
                <h3 className="text-sm font-medium text-brand-secondary dark:text-white mb-3 flex items-center gap-2">
                  <FaFileAlt size={16} />
                  {t('applications.coverLetter') || 'Thư giới thiệu'}
                </h3>
                <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-brand-text dark:text-gray-300 whitespace-pre-line">
                    {application.cover_letter_text || application.cover_letter}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Scores (if available) */}
            {(application.overall_score || application.skills_match_score) && (
              <motion.div
                variants={slideRight}
                className="mb-6"
              >
                <h3 className="text-sm font-medium text-brand-secondary dark:text-white mb-3">
                  {t('applications.scores') || 'Điểm đánh giá'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {application.overall_score && (
                    <div className="p-4 bg-brand-light/20 dark:bg-gray-700/30 rounded-xl text-center">
                      <p className="text-2xl font-bold text-brand-primary">{application.overall_score}%</p>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {t('applications.overall') || 'Tổng quan'}
                      </p>
                    </div>
                  )}
                  {application.skills_match_score && (
                    <div className="p-4 bg-brand-light/20 dark:bg-gray-700/30 rounded-xl text-center">
                      <p className="text-2xl font-bold text-brand-primary">{application.skills_match_score}%</p>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {t('applications.skillsMatch') || 'Kỹ năng'}
                      </p>
                    </div>
                  )}
                  {application.culture_fit_score && (
                    <div className="p-4 bg-brand-light/20 dark:bg-gray-700/30 rounded-xl text-center">
                      <p className="text-2xl font-bold text-brand-primary">{application.culture_fit_score}%</p>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {t('applications.cultureFit') || 'Văn hóa'}
                      </p>
                    </div>
                  )}
                  {application.retention_score && (
                    <div className="p-4 bg-brand-light/20 dark:bg-gray-700/30 rounded-xl text-center">
                      <p className="text-2xl font-bold text-brand-primary">{application.retention_score}%</p>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {t('applications.retention') || 'Gắn bó'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ApplicationDetail