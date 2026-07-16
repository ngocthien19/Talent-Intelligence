import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { FaBriefcase, FaArrowRight } from 'react-icons/fa'
import JobCard from '~/components/common/JobCard'

const FeaturedJobs = ({ jobs, isLoading, formatSalary, getExperienceLabel, getDaysAgo }) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <section className="py-12">
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
      </section>
    )
  }

  return (
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

      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              formatSalary={formatSalary}
              getExperienceLabel={getExperienceLabel}
              getDaysAgo={getDaysAgo}
            />
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
  )
}

export default FeaturedJobs