import { motion, AnimatePresence } from 'framer-motion'
import { FaBriefcase } from 'react-icons/fa'
import JobCard from '~/components/common/JobCard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

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

const JobList = ({ jobs, selectedJobId, onSelectJob, formatSalary, getExperienceLabel, getDaysAgo }) => {
  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-12 text-center"
      >
        <FaBriefcase size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
        <p className="text-brand-text dark:text-gray-400">
          Không tìm thấy công việc phù hợp
        </p>
        <p className="text-sm text-brand-text/60 dark:text-gray-500 mt-1">
          Hãy thử thay đổi bộ lọc tìm kiếm
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence mode="wait">
        {jobs.map((job) => (
          <motion.div
            key={job.id}
            variants={itemVariants}
            layout
            transition={{ duration: 0.3 }}
          >
            <JobCard
              job={job}
              isSelected={selectedJobId === job.id}
              onClick={() => onSelectJob(job.id)}
              formatSalary={formatSalary}
              getExperienceLabel={getExperienceLabel}
              getDaysAgo={getDaysAgo}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default JobList