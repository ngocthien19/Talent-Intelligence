import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSpinner, FaArrowLeft } from 'react-icons/fa'
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
    navigate('/hr/candidates')
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
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">Có lỗi xảy ra</h3>
          <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">{error || 'Không tìm thấy ứng viên'}</p>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors cursor-pointer"
          >
            {t('common.back') || 'Quay lại'}
          </button>
        </div>
      </div>
    )
  }

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
        className="inline-flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-light transition-colors duration-200 cursor-pointer"
      >
        <FaArrowLeft size={14} />
        {t('common.back') || 'Quay lại danh sách'}
      </motion.button>

      {/* Header */}
      <CandidateDetailHeader candidate={candidate} />

      {/* Stats */}
      <CandidateDetailStats candidate={candidate} />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <CandidateDetailInfo candidate={candidate} />
          <CandidateDetailJob candidate={candidate} />
          <CandidateDetailSkills candidate={candidate} />
        </div>

        {/* Right column - 1 column */}
        <div className="space-y-6">
          <CandidateDetailTimeline candidate={candidate} />
        </div>
      </div>
    </motion.div>
  )
}

export default CandidateDetail