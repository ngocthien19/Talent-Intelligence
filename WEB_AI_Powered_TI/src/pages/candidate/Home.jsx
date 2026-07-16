import { useState, useEffect } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/candidate/job.api'
import HeroSection from '~/components/candidate/home/HeroSection'
import ActionCards from '~/components/candidate/home/ActionCards'
import FeaturedJobs from '~/components/candidate/home/FeaturedJobs'
import CTASection from '~/components/candidate/home/CTASection'
import { formatSalary, getDaysAgo } from '~/utils/format'
import { getExperienceLabel } from '~/utils/constant'

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