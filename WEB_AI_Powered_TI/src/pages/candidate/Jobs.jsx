import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/candidate/job.api'
import { useDispatch } from 'react-redux'
import { getFavorites } from '~/redux/slices/favorite.slice'
import { useAuth } from '~/hooks/useAuth'
import SearchForm from '~/components/candidate/home/SearchForm'
import JobFilters from '~/components/candidate/jobs/JobFilters'
import JobList from '~/components/candidate/jobs/JobList'
import JobDetail from '~/components/candidate/jobs/JobDetail'
import Pagination from '~/components/common/Pagination'
import { toast } from 'react-toastify'

const Jobs = () => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filterOptions, setFilterOptions] = useState({})
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 5
  })

  // Active filters
  const [activeFilters, setActiveFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    category_id: searchParams.get('category') || '',
    experience_level: '',
    employment_type: ''
  })

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
      dispatch(getFavorites())
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
        limit: pagination.limit,
        offset: (pagination.currentPage - 1) * pagination.limit
      }

      // Remove undefined values
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

        // Select first job if none selected
        if (response.data.length > 0 && !selectedJob) {
          setSelectedJob(response.data[0])
        }
      }
    } catch (error) {
      toast.error('Không thể tải danh sách công việc')
      console.error('Fetch jobs error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [activeFilters, pagination.currentPage, pagination.limit, selectedJob])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
    // Update URL params
    if (value) {
      searchParams.set(key, value)
    } else {
      searchParams.delete(key)
    }
    setSearchParams(searchParams)
  }

  // Handle clear all filters
  const handleClearFilters = () => {
    setActiveFilters({
      keyword: '',
      location: '',
      category_id: '',
      experience_level: '',
      employment_type: ''
    })
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
    setSearchParams(new URLSearchParams())
  }

  // Handle clear single filter
  const handleClearFilter = (key) => {
    handleFilterChange(key, '')
  }

  // Handle search from SearchForm
  const handleSearch = (keyword) => {
    setActiveFilters(prev => ({
      ...prev,
      keyword: keyword || ''
    }))
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }))
    if (keyword) {
      searchParams.set('keyword', keyword)
    } else {
      searchParams.delete('keyword')
    }
    setSearchParams(searchParams)
  }

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle select job
  const handleSelectJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId)
    setSelectedJob(job)
    // On mobile, scroll to detail
    if (window.innerWidth < 1024) {
      document.getElementById('job-detail')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Format utilities
  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Thương lượng'
    const { min, max, currency } = salaryRange
    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} ${currency || 'VND'}`
    }
    if (min) return `Từ ${formatNumber(min)} ${currency || 'VND'}`
    if (max) return `Đến ${formatNumber(max)} ${currency || 'VND'}`
    return 'Thương lượng'
  }

  const formatNumber = (num) => {
    if (!num) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const getDaysAgo = (date) => {
    const now = new Date()
    const created = new Date(date)
    const diffTime = Math.abs(now - created)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return '1 ngày trước'
    return `${diffDays} ngày trước`
  }

  const getExperienceLabel = (level) => {
    const labels = {
      'entry': 'Mới tốt nghiệp',
      'junior': 'Junior (1-3 năm)',
      'mid': 'Mid-level (3-5 năm)',
      'senior': 'Senior (5-7 năm)',
      'lead': 'Lead (7-10 năm)',
      'manager': 'Manager (10+ năm)'
    }
    return labels[level] || level
  }

  return (
    <div className="animate-fade-in py-6">
      {/* Search Form */}
      <div className="mb-6">
        <SearchForm onSearch={handleSearch} initialKeyword={activeFilters.keyword} />
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
          {t('jobs.found') || 'Tìm thấy'} {pagination.total} {t('jobs.jobs') || 'việc làm'}
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

      {/* Pagination  */}
      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  )
}

export default Jobs