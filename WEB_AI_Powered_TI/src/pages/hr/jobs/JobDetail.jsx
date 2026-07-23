// src/pages/hr/jobs/JobDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaSpinner, FaArrowLeft } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/hr/job.api'

import JobDetailHeader from '~/components/hr/jobs/detail/JobDetailHeader'
import JobDetailStats from '~/components/hr/jobs/detail/JobDetailStats'
import JobDetailInfo from '~/components/hr/jobs/detail/JobDetailInfo'
import JobDetailSkills from '~/components/hr/jobs/detail/JobDetailSkills'
import JobDetailCandidates from '~/components/hr/jobs/detail/JobDetailCandidates'

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

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [isLoading, setIsLoading] = useState(true)
  const [job, setJob] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchJobDetail()
  }, [id])

  const fetchJobDetail = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await jobApi.getJobDetail(id)
      if (response.success) {
        const { job, candidates, stats } = response.data
        setJob(job)
        setCandidates(candidates || [])
        setStats(stats || {
          total: 0,
          pending: 0,
          analyzed: 0,
          shortlisted: 0,
          interviewed: 0,
          offered: 0,
          hired: 0,
          rejected: 0
        })
      } else {
        setError(response.message || 'Không thể tải thông tin công việc')
        toast.error(response.message || 'Không thể tải thông tin công việc')
      }
    } catch (err) {
      setError(err.message || 'Không thể tải thông tin công việc')
      toast.error('Không thể tải thông tin công việc')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/hr/jobs')
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

  if (error || !job) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">!</div>
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">Có lỗi xảy ra</h3>
          <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">{error || 'Không tìm thấy công việc'}</p>
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
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:text-white dark:border-brand-primary dark:text-brand-light dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
      >
        <FaArrowLeft size={14} />
        {t('hr.job.backToList') || 'Quay lại danh sách'}
      </motion.button>

      {/* Header */}
      <JobDetailHeader job={job} />

      {/* Stats */}
      <JobDetailStats stats={stats} />

      {/* Main content - full width */}
      <div className="space-y-6">
        <JobDetailInfo job={job} />
        <JobDetailSkills job={job} />
        <JobDetailCandidates candidates={candidates} jobId={job?.id} />
      </div>
    </motion.div>
  )
}

export default JobDetail