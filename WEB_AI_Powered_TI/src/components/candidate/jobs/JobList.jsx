import { FaBriefcase } from 'react-icons/fa'
import JobCard from '~/components/common/JobCard'

const JobList = ({ jobs, selectedJobId, onSelectJob, formatSalary, getExperienceLabel, getDaysAgo }) => {
  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-12 text-center">
        <FaBriefcase size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
        <p className="text-brand-text dark:text-gray-400">
          Không tìm thấy công việc phù hợp
        </p>
        <p className="text-sm text-brand-text/60 dark:text-gray-500 mt-1">
          Hãy thử thay đổi bộ lọc tìm kiếm
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedJobId === job.id}
          onClick={() => onSelectJob(job.id)}
          formatSalary={formatSalary}
          getExperienceLabel={getExperienceLabel}
          getDaysAgo={getDaysAgo}
        />
      ))}
    </div>
  )
}

export default JobList