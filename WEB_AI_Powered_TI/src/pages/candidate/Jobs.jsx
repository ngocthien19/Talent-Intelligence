// Jobs.jsx
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/candidate/job.api'
import { useDispatch } from 'react-redux'
import { getFavorites } from '~/redux/slices/favorite.slice'
import { syncFavorites } from '~/redux/slices/auth.slice'
import { useAuth } from '~/hooks/useAuth'
import { motion } from 'framer-motion'
import { FaSearch } from 'react-icons/fa'
import JobFilters from '~/components/candidate/jobs/JobFilters'
import JobList from '~/components/candidate/jobs/JobList'
import JobDetail from '~/components/candidate/jobs/JobDetail'
import Pagination from '~/components/common/Pagination'
import { toast } from 'react-toastify'
import {
  formatSalary,
  getDaysAgo
} from '~/utils/format'
import {
  getExperienceLabel
} from '~/utils/constant'
import { useScrollToTop } from '~/hooks/useScrollToTop'

const Jobs = () => {
  useScrollToTop()
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState({})
  const [searchInput, setSearchInput] = useState(searchParams.get('keyword') || '')

  // Lấy page từ URL params, mặc định là 1
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const [pagination, setPagination] = useState({
    currentPage: currentPage,
    totalPages: 1,
    total: 0,
    limit: 5
  })

  // Active filters - lấy từ URL params
  const [activeFilters, setActiveFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    category_id: searchParams.get('category_id') || '',
    experience_level: searchParams.get('experience_level') || '',
    employment_type: searchParams.get('employment_type') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || ''
  })

  // 👉 Lắng nghe URL params thay đổi
  useEffect(() => {
    const keyword = searchParams.get('keyword') || ''
    const location = searchParams.get('location') || ''
    const category_id = searchParams.get('category_id') || ''
    const experience_level = searchParams.get('experience_level') || ''
    const employment_type = searchParams.get('employment_type') || ''
    const minSalary = searchParams.get('minSalary') || ''
    const maxSalary = searchParams.get('maxSalary') || ''

    setActiveFilters(prev => ({
      ...prev,
      keyword,
      location,
      category_id,
      experience_level,
      employment_type,
      minSalary,
      maxSalary
    }))
    setSearchInput(keyword)

    const page = parseInt(searchParams.get('page') || '1', 10)
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
  }, [searchParams])

  // 👉 Đồng bộ URL với activeFilters
  useEffect(() => {
    const params = new URLSearchParams()
    Object.keys(activeFilters).forEach(key => {
      if (activeFilters[key]) {
        params.set(key, activeFilters[key])
      }
    })
    if (pagination.currentPage > 1) {
      params.set('page', pagination.currentPage)
    }
    setSearchParams(params, { replace: true })
  }, [activeFilters, pagination.currentPage, setSearchParams])

  // 👉 Fetch khi URL thay đổi
  useEffect(() => {
    fetchJobs()
  }, [searchParams])

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await jobApi.getFilterOptions()
        if (response.success) {
          setFilterOptions(response.data)
        }
      } catch (error) {
        console.error('Fetch filter options error:', error)
      }
    }
    fetchFilterOptions()
  }, [])

  // Fetch favorites only when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getFavorites()).then((result) => {
        if (result.payload?.data) {
          const ids = result.payload.data.map(fav => fav.job_id)
          dispatch(syncFavorites(ids))
        }
      })
    }
  }, [dispatch, isAuthenticated])

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = {
        keyword: activeFilters.keyword || undefined,
        location: activeFilters.location || undefined,
        category_id: activeFilters.category_id || undefined,
        experience_level: activeFilters.experience_level || undefined,
        employment_type: activeFilters.employment_type || undefined,
        min_salary: activeFilters.minSalary || undefined,
        max_salary: activeFilters.maxSalary || undefined,
        limit: pagination.limit,
        offset: (pagination.currentPage - 1) * pagination.limit
      }

      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === '') {
          delete params[key]
        }
      })

      const response = await jobApi.getJobs(params)
      if (response.success) {
        setJobs(response.data)
        setPagination(prev => ({
          ...prev,
          totalPages: response.pagination.totalPages,
          total: response.pagination.total
        }))

        if (response.data.length > 0) {
          setSelectedJob(response.data[0])
        } else {
          setSelectedJob(null)
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách công việc')
    } finally {
      setIsLoading(false)
    }
  }, [activeFilters, pagination.currentPage, pagination.limit])

  // 👉 Xử lý search
  const handleSearch = (e) => {
    e.preventDefault()
    setActiveFilters(prev => ({
      ...prev,
      keyword: searchInput.trim()
    }))
  }

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Handle clear all filters
  const handleClearFilters = () => {
    setActiveFilters({
      keyword: '',
      location: '',
      category_id: '',
      experience_level: '',
      employment_type: '',
      minSalary: '',
      maxSalary: ''
    })
    setSearchInput('')
  }

  // Handle clear single filter
  const handleClearFilter = (key) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: ''
    }))
  }

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  // Handle select job
  const handleSelectJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId)
    setSelectedJob(job)
    if (window.innerWidth < 1024) {
      document.getElementById('job-detail')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="app-container animate-fade-in py-6"
    >
      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('home.searchPlaceholder') || 'Tìm kiếm việc làm...'}
              className="w-full pl-12 pr-20 py-3.5 bg-white dark:bg-gray-800 border border-brand-light dark:border-gray-700 rounded-xl shadow-custom focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary outline-none transition-all duration-300 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-400" size={18} />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-brand text-white rounded-lg font-medium hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
            >
              {t('home.search') || 'Tìm kiếm'}
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <JobFilters
          filters={{ options: filterOptions, active: activeFilters }}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onClearFilter={handleClearFilter}
        />
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-sm text-brand-text dark:text-gray-400">
          {activeFilters.keyword ? (
            <>
              {t('jobs.found') || 'Tìm thấy'} {' '}
              <span className="font-semibold text-brand-primary">{pagination.total}</span>
              {' '}{t('jobs.jobs') || 'việc làm'}{' '}
              {t('jobs.withKeyword') || 'với từ khóa'}{' '}
              <span className="font-semibold text-brand-primary">"{activeFilters.keyword}"</span>
            </>
          ) : (
            <>
              {t('jobs.found') || 'Tìm thấy'} {' '}
              <span className="font-semibold text-brand-primary">{pagination.total}</span>
              {' '}{t('jobs.jobs') || 'việc làm'}
            </>
          )}
        </p>
      </div>

      {/* Job List and Detail - 40% / 60% */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Job List - 40% (2/5) */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 skeleton-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <JobList
              jobs={jobs}
              selectedJobId={selectedJob?.id}
              onSelectJob={handleSelectJob}
              formatSalary={formatSalary}
              getExperienceLabel={getExperienceLabel}
              getDaysAgo={getDaysAgo}
            />
          )}
        </div>

        {/* Right: Job Detail - 60% (3/5) */}
        <div className="lg:col-span-3" id="job-detail">
          {selectedJob ? (
            <JobDetail
              job={selectedJob}
              onBack={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              formatSalary={formatSalary}
              getExperienceLabel={getExperienceLabel}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-8 text-center sticky top-24">
              <p className="text-brand-text dark:text-gray-400">
                {t('jobs.selectJob') || 'Chọn một công việc để xem chi tiết'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </motion.div>
  )
}

export default Jobs