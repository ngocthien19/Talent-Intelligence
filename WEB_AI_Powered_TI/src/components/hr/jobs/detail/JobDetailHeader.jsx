import { motion } from 'framer-motion'
import { FaBriefcase, FaBuilding, FaMapMarkerAlt, FaClock, FaCalendarAlt } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import JobStatusBadge from '../JobStatusBadge'
import { formatDate, formatSalary } from '~/utils/format'

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

const JobDetailHeader = ({ job }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
              <FaBriefcase size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
                {job.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <JobStatusBadge isActive={job.is_active} />
                {job.category_name && (
                  <span className="text-sm text-brand-text/60 dark:text-gray-400">
                    {job.category_name}
                  </span>
                )}
                <span className="text-sm text-brand-text/60 dark:text-gray-400">
                  {t('hr.job.createdAt') || 'Ngày tạo'}: {job.created_at ? formatDate(new Date(job.created_at)) : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Job info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {job.company_name && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400">
                <FaBuilding size={14} className="text-brand-primary" />
                <span>{job.company_name}</span>
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400">
                <FaMapMarkerAlt size={14} className="text-brand-primary" />
                <span>{job.location}</span>
              </div>
            )}
            {job.employment_type && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400">
                <FaClock size={14} className="text-brand-primary" />
                <span>{job.employment_type}</span>
              </div>
            )}
            {job.experience_level && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400">
                <FaCalendarAlt size={14} className="text-brand-primary" />
                <span>{job.experience_level}</span>
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400">
                <FaBriefcase size={14} className="text-brand-primary" />
                <span>{formatSalary(job.salary_range)}</span>
              </div>
            )}
          </div>
        </div>

        {/* ID */}
        <div className="flex-shrink-0">
          <span className="text-xs font-medium px-3 py-1 bg-brand-light/20 dark:bg-gray-700/30 rounded-full text-brand-text/60 dark:text-gray-400">
            ID: {job.id?.slice(0, 8) || '--'}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default JobDetailHeader