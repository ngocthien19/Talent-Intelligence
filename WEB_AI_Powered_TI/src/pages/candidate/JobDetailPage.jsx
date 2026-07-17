import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/candidate/job.api'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite, getFavorites } from '~/redux/slices/favorite.slice'
import { useAuth } from '~/hooks/useAuth'
import { FaBriefcase, FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

import Breadcrumb from '~/components/common/Breadcrumb'
import JobDetailContent from '~/components/candidate/job-detail/JobDetailContent'
import JobDetailSidebar from '~/components/candidate/job-detail/JobDetailSidebar'
import RelatedJobs from '~/components/candidate/job-detail/RelatedJobs'
import {
  formatSalary,
  getDaysAgo
} from '~/utils/format'
import {
  getExperienceLabel
} from '~/utils/constant'
import { syncFavorites } from '~/redux/slices/auth.slice'

const JobDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const { favoriteIds } = useSelector((state) => state.favorite)
  const [job, setJob] = useState(null)
  const [relatedJobs, setRelatedJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRelatedLoading, setIsRelatedLoading] = useState(true)

  useEffect(() => {
    fetchJobDetail()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getFavorites()).then((result) => {
        // Đồng bộ favoriteIds từ API vào auth slice
        if (result.payload?.data) {
          const ids = result.payload.data.map(fav => fav.job_id)
          dispatch(syncFavorites(ids))
        }
      })
    }
  }, [dispatch, isAuthenticated])

  const fetchJobDetail = async () => {
    setIsLoading(true)
    setIsRelatedLoading(true)
    try {
      const response = await jobApi.getJobDetail(id)
      if (response.success) {
        setJob(response.data)
        fetchRelatedJobs(response.data.id)
      }
    } catch (error) {
      toast.error('Không thể tải thông tin công việc')
      console.error('Fetch job detail error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRelatedJobs = async (jobId) => {
    try {
      const response = await jobApi.getRelatedJobs(jobId, 6)
      if (response.success) {
        setRelatedJobs(response.data || [])
      }
    } catch (error) {
      console.error('Fetch related jobs error:', error)
    } finally {
      setIsRelatedLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-8 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="animate-fade-in py-6">
        <div className="max-w-6xl mx-auto text-center py-12">
          <FaBriefcase size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-secondary dark:text-white mb-2">
            Không tìm thấy công việc
          </h2>
          <p className="text-brand-text dark:text-gray-400 mb-6">
            Công việc bạn đang tìm không tồn tại hoặc đã bị xóa
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer"
          >
            <FaArrowLeft size={16} />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in py-6">
      <div className="app-container max-w-6xl mx-auto">
        <Breadcrumb
          items={[
            { label: t('header.home') || 'Trang chủ', link: '/' },
            { label: t('header.jobs') || 'Việc làm', link: '/jobs' },
            { label: job.title }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <JobDetailContent
            job={job}
            getExperienceLabel={getExperienceLabel}
          />

          <JobDetailSidebar
            job={job}
            getExperienceLabel={getExperienceLabel}
          />
        </div>

        {/* Related Jobs */}
        <div className="mt-10">
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl p-6 border border-indigo-100/50 dark:border-indigo-800/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-brand-secondary dark:text-white tracking-tight flex items-center gap-3 after:content-[''] after:inline-block after:w-20 after:h-[5px] after:bg-brand-primary/60 after:rounded-full">
                <FaBriefcase size={22} className="text-brand-primary dark:text-brand-primary" />
                {t('jobs.relatedJobs') || 'Công việc liên quan'}
              </h2>
              <Link
                to="/jobs"
                className="text-brand-primary hover:text-brand-secondary dark:hover:text-white font-medium flex items-center gap-1 transition-colors duration-300 cursor-pointer group"
              >
                {t('home.viewAll') || 'Xem tất cả'}
                <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            <RelatedJobs
              jobs={relatedJobs}
              isLoading={isRelatedLoading}
              formatSalary={formatSalary}
              getExperienceLabel={getExperienceLabel}
              getDaysAgo={getDaysAgo}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetailPage