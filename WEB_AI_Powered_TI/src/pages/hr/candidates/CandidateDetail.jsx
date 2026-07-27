import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSpinner, FaArrowLeft, FaFilePdf, FaFileWord, FaFile, FaExternalLinkAlt } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { candidateApi } from '~/api/hr/candidate.api'

import CandidateDetailHeader from '~/components/hr/candidate/detail/CandidateDetailHeader'
import CandidateDetailStats from '~/components/hr/candidate/detail/CandidateDetailStats'
import CandidateDetailInfo from '~/components/hr/candidate/detail/CandidateDetailInfo'
import CandidateDetailJob from '~/components/hr/candidate/detail/CandidateDetailJob'
import CandidateDetailSkills from '~/components/hr/candidate/detail/CandidateDetailSkills'
import CandidateDetailTimeline from '~/components/hr/candidate/detail/CandidateDetailTimeline'

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
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const getFileIcon = (mimeType) => {
  if (mimeType?.includes('pdf')) return FaFilePdf
  if (mimeType?.includes('word') || mimeType?.includes('document')) return FaFileWord
  return FaFile
}

const CandidateDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [isLoading, setIsLoading] = useState(true)
  const [candidate, setCandidate] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCandidateDetail()
  }, [id])

  const fetchCandidateDetail = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await candidateApi.getCandidateDetail(id)
      if (response.success) {
        setCandidate(response.data)
      } else {
        setError(response.message || 'Không thể tải thông tin ứng viên')
        toast.error(response.message || 'Không thể tải thông tin ứng viên')
      }
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin ứng viên')
      toast.error('Không thể tải thông tin ứng viên')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/hr/applications')
  }

  const handleViewCV = (cvUrl) => {
    if (cvUrl) {
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}&embedded=true`
      window.open(viewerUrl, '_blank')
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

  if (error || !candidate) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">{t('common.error') || 'Có lỗi xảy ra'}</h3>
          <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">{error || t('hr.candidate.detail.notFound')}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors cursor-pointer"
          >
            {t('hr.candidate.detail.backToList')}
          </button>
        </div>
      </div>
    )
  }

  const FileIcon = getFileIcon(candidate.cv_mime_type)
  const hasCV = candidate.cv_url && candidate.cv_url.trim() !== ''

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Back button */}
      <motion.button
        variants={itemVariants}
        onClick={handleBack}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white dark:border-brand-primary dark:text-brand-light dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
      >
        <FaArrowLeft size={14} />
        {t('hr.job.backToList') || 'Quay lại danh sách'}
      </motion.button>

      {/* Header */}
      <CandidateDetailHeader candidate={candidate} />

      {/* Stats */}
      <CandidateDetailStats candidate={candidate} />

      {/* CV Section - THÊM MỚI */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50"
      >
        <h3 className="text-sm font-medium text-brand-secondary dark:text-white mb-3 flex items-center gap-2">
          <FaFile size={16} className="text-brand-primary" />
          {t('applications.cv') || 'CV đã gửi'}
        </h3>
        {hasCV ? (
          <div className="flex flex-wrap items-center gap-3 p-4 bg-brand-light/20 dark:bg-gray-700/30 rounded-xl border border-brand-light/30 dark:border-gray-700/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <FileIcon
                size={24}
                className={`${candidate.cv_mime_type?.includes('pdf') ? 'text-red-500' : candidate.cv_mime_type?.includes('word') ? 'text-blue-500' : 'text-brand-text/60'}`}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
                  {candidate.cv_original_name || 'CV.pdf'}
                </p>
                {candidate.cv_file_size && (
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">
                    {(candidate.cv_file_size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleViewCV(candidate.cv_url)}
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

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CandidateDetailInfo candidate={candidate} />
          <CandidateDetailJob candidate={candidate} />
          <CandidateDetailSkills candidate={candidate} />
        </div>
        <div className="space-y-6">
          <CandidateDetailTimeline candidate={candidate} />
        </div>
      </div>
    </motion.div>
  )
}

export default CandidateDetail