import { useState, useEffect } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/candidate/job.api'
import HeroSection from '~/components/candidate/home/HeroSection'
import ActionCards from '~/components/candidate/home/ActionCards'
import FeaturedJobs from '~/components/candidate/home/FeaturedJobs'
import CTASection from '~/components/candidate/home/CTASection'

const Home = () => {
  const { t } = useLanguage()
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [jobCount, setJobCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

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
      <HeroSection jobCount={jobCount} />
      <ActionCards />
      <FeaturedJobs
        jobs={featuredJobs}
        isLoading={isLoading}
        formatSalary={formatSalary}
        getExperienceLabel={getExperienceLabel}
        getDaysAgo={getDaysAgo}
      />
      <CTASection />
    </div>
  )
}

export default Home