import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { FaBriefcase, FaArrowRight } from 'react-icons/fa'
import JobCard from '~/components/common/JobCard'

const RelatedJobs = ({ jobs, isLoading, formatSalary, getExperienceLabel, getDaysAgo }) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-700/50 rounded-xl p-6 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl">
        <p className="text-brand-text dark:text-gray-400">
          {t('jobs.noRelatedJobs') || 'Chưa có công việc liên quan'}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          formatSalary={formatSalary}
          getExperienceLabel={getExperienceLabel}
          getDaysAgo={getDaysAgo}
          showCategory={true}
          variant="default"
        />
      ))}
    </div>
  )
}

export default RelatedJobs