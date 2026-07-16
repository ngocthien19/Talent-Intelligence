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
    <section className="app-container w-full py-20 dark:bg-[#020817]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            {/* Đã thêm Icon và khối hình chữ nhật (after) bo tròn tạo điểm nhấn */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-secondary dark:text-white tracking-tight flex items-center gap-3 after:content-[''] after:hidden sm:after:inline-block after:w-16 md:after:w-24 after:h-[6px] after:bg-brand-primary/60 after:rounded-full">
              <FaBriefcase className="text-brand-primary dark:text-brand-primary" size={32} />
              {t('home.featuredJobs') || 'Việc làm nổi bật'}
            </h2>
            <p className="text-brand-text dark:text-gray-400 mt-3 text-lg">
              {t('home.featuredJobsDesc') || 'Những cơ hội việc làm hấp dẫn nhất dành cho bạn'}
            </p>
          </div>
          <Link
            to="/jobs"
            className="text-brand-primary hover:text-brand-secondary dark:hover:text-white font-semibold flex items-center gap-2 transition-colors duration-300 cursor-pointer group bg-white dark:bg-gray-800 px-5 py-2.5 rounded-xl border border-brand-light dark:border-gray-700 shadow-sm"
          >
            {t('home.viewAll') || 'Xem tất cả'}
            <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>

        {jobs?.length > 0 ? (
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
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-brand-light/50 dark:border-gray-700">
            <FaBriefcase size={56} className="text-brand-light dark:text-gray-700 mx-auto mb-4" />
            <p className="text-lg text-brand-text dark:text-gray-400">
              {t('home.noJobs') || 'Chưa có công việc nào được đăng tải'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FeaturedJobs