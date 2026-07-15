import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/candidate/job.api'
import {
  FaSearch,
  FaBriefcase,
  FaUpload,
  FaArrowRight,
  FaLightbulb,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaBuilding,
  FaRegBookmark,
  FaRocket,
  FaComments,
  FaRobot,
  FaCheck
} from 'react-icons/fa'
import { toast } from 'react-toastify'

const Home = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [jobCount, setJobCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const locationRef = useRef(null)

  // Danh sách thành phố
  const locations = [
    { value: '', label: 'Tất cả địa điểm' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Hải Phòng', label: 'Hải Phòng' },
    { value: 'Cần Thơ', label: 'Cần Thơ' },
    { value: 'Nha Trang', label: 'Nha Trang' },
    { value: 'Huế', label: 'Huế' },
    { value: 'Vũng Tàu', label: 'Vũng Tàu' },
    { value: 'Đà Lạt', label: 'Đà Lạt' },
    { value: 'Biên Hòa', label: 'Biên Hòa' },
    { value: 'Bình Dương', label: 'Bình Dương' }
  ]

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchHomeData = async () => {
    setIsLoading(true)
    try {
      const jobsResponse = await jobApi.getFeaturedJobs(6)
      if (jobsResponse.success) {
        setFeaturedJobs(jobsResponse.data || [])
      }

      const countResponse = await jobApi.getJobCount()
      if (countResponse.success) {
        setJobCount(countResponse.data?.total || 0)
      }
    } catch (error) {
      console.error('Fetch home data error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHomeData()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchKeyword) params.append('keyword', searchKeyword)
    if (searchLocation) params.append('location', searchLocation)
    navigate(`/jobs?${params.toString()}`)
  }

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
    <div className="animate-fade-in">
      {/* Hero Section - Tìm kiếm việc làm */}
      <section className="py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="hero-badge inline-flex items-center gap-2 bg-brand-light dark:bg-gray-800 text-brand-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <FaLightbulb size={16} />
            {t('home.heroBadge', { count: jobCount }) || `Hơn ${jobCount.toLocaleString()}+ việc làm đang chờ bạn`}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-secondary dark:text-white mb-6 leading-tight">
            {t('home.heroTitle') || 'Tìm việc làm phù hợp'}
            <br />
            <span className="text-gradient">{t('home.heroSubtitle') || 'Nhanh chóng - Thông minh - Chính xác'}</span>
          </h1>
          <p className="text-lg md:text-xl text-brand-text dark:text-gray-300 max-w-2xl mx-auto mb-8">
            {t('home.heroDesc') || 'Hàng ngàn cơ hội việc làm đang chờ bạn. Tìm kiếm thông minh với AI, ứng tuyển dễ dàng chỉ với vài cú click.'}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form flex flex-col md:flex-row gap-3 max-w-3xl mx-auto bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-glow border border-brand-light dark:border-gray-700 transition-all duration-300">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-400" size={18} />
              <input
                type="text"
                placeholder={t('home.searchPlaceholder') || 'Tìm kiếm việc làm...'}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent dark:bg-transparent border-0 focus:ring-0 focus:outline-none text-brand-secondary dark:text-white placeholder:text-brand-text/40 transition-colors duration-300"
              />
            </div>

            {/* Divider */}
            <div className="hidden md:flex items-center text-brand-border dark:text-gray-600 select-none">
              <span className="text-2xl font-light opacity-50">|</span>
            </div>

            {/* Location Dropdown */}
            <div ref={locationRef} className="relative md:w-52">
              <button
                type="button"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="w-full flex items-center gap-2 px-4 py-3 text-left bg-transparent dark:bg-transparent border-0 focus:ring-0 focus:outline-none text-brand-secondary dark:text-white hover:bg-brand-light/20 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-200 cursor-pointer"
              >
                <FaMapMarkerAlt className="text-brand-text/40 dark:text-gray-400 flex-shrink-0" size={18} />
                <span className="flex-1 truncate">
                  {searchLocation || (t('home.locationPlaceholder') || 'Địa điểm...')}
                </span>
                <svg
                  className={`w-4 h-4 text-brand-text/40 dark:text-gray-400 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isLocationOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-bold border border-brand-light dark:border-gray-700 py-1 animate-fade-in">
                  {locations.map((location) => (
                    <button
                      key={location.value}
                      type="button"
                      onClick={() => {
                        setSearchLocation(location.value)
                        setIsLocationOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-brand-light dark:hover:bg-gray-700 cursor-pointer ${
                        searchLocation === location.value
                          ? 'text-brand-primary bg-brand-light/50 dark:bg-gray-700/50 font-medium'
                          : 'text-brand-secondary dark:text-gray-300'
                      }`}
                    >
                      {location.label}
                      {searchLocation === location.value && (
                        <FaCheck className="float-right mt-0.5 text-brand-primary" size={14} />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="search-btn px-8 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 whitespace-nowrap cursor-pointer hover:scale-[1.02]"
            >
              {t('home.search') || 'Tìm kiếm'}
            </button>
          </form>

          {/* Quick action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
            <Link
              to="/jobs"
              className="quick-action-link text-sm text-brand-text/70 dark:text-gray-400 hover:text-brand-primary transition-all duration-300 flex items-center gap-1 cursor-pointer"
            >
              <FaBriefcase size={14} />
              {t('home.browseAllJobs') || 'Xem tất cả việc làm'}
            </Link>
            <span className="text-brand-text/20 dark:text-gray-600">|</span>
            <Link
              to="/upload-cv"
              className="quick-action-link text-sm text-brand-text/70 dark:text-gray-400 hover:text-brand-primary transition-all duration-300 flex items-center gap-1 cursor-pointer"
            >
              <FaUpload size={14} />
              {t('home.uploadCV') || 'Upload CV để được gợi ý'}
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Action Cards: Tìm việc | Upload CV | Mock Interview */}
      <section className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Tìm việc */}
          <Link
            to="/jobs"
            className="action-card group bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 hover:shadow-glow dark:hover:shadow-gray-800/50 transition-all duration-300 text-center cursor-pointer"
          >
            <div className="action-icon w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaSearch className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
              {t('home.findJobs') || 'Tìm việc làm'}
            </h3>
            <p className="text-sm text-brand-text dark:text-gray-400">
              {t('home.findJobsDesc') || 'Khám phá hàng ngàn cơ hội việc làm phù hợp với kỹ năng của bạn'}
            </p>
            <span className="action-arrow inline-block mt-3 text-brand-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-300 cursor-pointer">
              {t('home.exploreNow') || 'Khám phá ngay →'}
            </span>
          </Link>

          {/* Card 2: Upload CV */}
          <Link
            to="/upload-cv"
            className="action-card group bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 hover:shadow-glow dark:hover:shadow-gray-800/50 transition-all duration-300 text-center cursor-pointer"
          >
            <div className="action-icon w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaUpload className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
              {t('home.uploadCV') || 'Upload CV'}
            </h3>
            <p className="text-sm text-brand-text dark:text-gray-400">
              {t('home.uploadCVDesc') || 'Tải lên CV để AI phân tích và gợi ý công việc phù hợp nhất với bạn'}
            </p>
            <span className="action-arrow inline-block mt-3 text-brand-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-300 cursor-pointer">
              {t('home.uploadNow') || 'Tải lên ngay →'}
            </span>
          </Link>

          {/* Card 3: Mock Interview */}
          <Link
            to="/mock-interview"
            className="action-card group bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 hover:shadow-glow dark:hover:shadow-gray-800/50 transition-all duration-300 text-center cursor-pointer"
          >
            <div className="action-icon w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <FaRobot className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
              {t('home.mockInterview') || 'Mock Interview'}
            </h3>
            <p className="text-sm text-brand-text dark:text-gray-400">
              {t('home.mockInterviewDesc') || 'Luyện tập phỏng vấn với AI, nhận phản hồi và cải thiện kỹ năng của bạn'}
            </p>
            <span className="action-arrow inline-block mt-3 text-brand-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-300 cursor-pointer">
              {t('home.tryNow') || 'Thử ngay →'}
            </span>
          </Link>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-brand-secondary dark:text-white">
              {t('home.featuredJobs') || 'Việc làm nổi bật'}
            </h2>
            <p className="text-brand-text dark:text-gray-400 mt-1">
              {t('home.featuredJobsDesc') || 'Những cơ hội việc làm hấp dẫn nhất dành cho bạn'}
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-brand-primary hover:text-brand-secondary dark:hover:text-white font-medium flex items-center gap-1 transition-colors duration-300 cursor-pointer group"
          >
            {t('home.viewAll') || 'Xem tất cả'}
            <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 skeleton-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="job-card group bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 hover:shadow-glow dark:hover:shadow-gray-800/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {job.company_logo ? (
                      <img
                        src={job.company_logo}
                        alt={job.company_name}
                        className="company-logo w-12 h-12 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="company-logo w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-lg transition-transform duration-300 group-hover:scale-105">
                        {job.company_name?.charAt(0) || 'C'}
                      </div>
                    )}
                    <div>
                      <h3 className="job-title font-semibold text-black dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-primary transition-colors duration-300 line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-sm text-brand-text dark:text-gray-400 flex items-center gap-1">
                        <FaBuilding size={12} />
                        {job.company_name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    className="bookmark-btn text-brand-text/40 hover:text-brand-primary transition-all duration-300 cursor-pointer hover:scale-110"
                  >
                    <FaRegBookmark size={18} />
                  </button>
                </div>

                <div className="space-y-2 mt-3">
                  <p className="text-sm text-brand-text dark:text-gray-300 line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {job.location && (
                    <span className="inline-flex items-center gap-1 text-xs bg-brand-light dark:bg-gray-700 text-brand-text dark:text-gray-300 px-2 py-1 rounded-full">
                      <FaMapMarkerAlt size={12} />
                      {job.location}
                    </span>
                  )}
                  {job.experience_level && (
                    <span className="inline-flex items-center gap-1 text-xs bg-brand-light dark:bg-gray-700 text-brand-text dark:text-gray-300 px-2 py-1 rounded-full">
                      <FaClock size={12} />
                      {getExperienceLabel(job.experience_level)}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="inline-flex items-center gap-1 text-xs bg-brand-light dark:bg-gray-700 text-brand-text dark:text-gray-300 px-2 py-1 rounded-full">
                      <FaMoneyBillWave size={12} />
                      {formatSalary(job.salary_range)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-light dark:border-gray-700">
                  <span className="text-xs text-brand-text/60 dark:text-gray-500">
                    {getDaysAgo(job.created_at)}
                  </span>
                  <span className="text-xs font-medium text-brand-primary">
                    {job.employment_type || 'Full-time'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30">
            <FaBriefcase size={48} className="text-brand-light dark:text-gray-700 mx-auto mb-4" />
            <p className="text-brand-text dark:text-gray-400">
              {t('home.noJobs') || 'Chưa có công việc nào được đăng tải'}
            </p>
          </div>
        )}
      </section>

      {/* CTA Section - Khuyến khích upload CV */}
      <section className="py-12">
        <div className="cta-section bg-gradient-brand rounded-2xl p-8 md:p-12 text-center text-white max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaRobot className="text-3xl animate-bounce" />
            <FaRocket className="text-3xl animate-pulse" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('home.ctaTitle') || 'Để AI giúp bạn tìm việc phù hợp nhất'}
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            {t('home.ctaDesc') || 'Upload CV của bạn, AI sẽ phân tích và gợi ý những công việc phù hợp nhất với kỹ năng và kinh nghiệm của bạn.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/upload-cv"
              className="cta-btn inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-primary rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <FaUpload size={18} />
              {t('home.uploadCV') || 'Upload CV ngay'}
              <FaArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/mock-interview"
              className="cta-btn-outline inline-flex items-center gap-2 px-8 py-3 bg-white/20 text-white border-2 border-white/50 rounded-lg font-medium hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <FaComments size={18} />
              {t('home.tryMockInterview') || 'Thử Mock Interview'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home