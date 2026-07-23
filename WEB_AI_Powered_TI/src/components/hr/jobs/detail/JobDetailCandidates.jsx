import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaUsers, FaEye, FaChevronRight } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CandidateStatusBadge from '~/components/hr/candidate/CandidateStatusBadge'

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

const JobDetailCandidates = ({ candidates, jobId }) => {
  const { t } = useLanguage()

  if (!candidates || candidates.length === 0) {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-secondary dark:text-white flex items-center gap-2">
            <FaUsers size={18} className="text-brand-primary" />
            {t('hr.job.candidates') || 'Ứng viên ứng tuyển'}
          </h2>
        </div>
        <div className="text-center py-8 text-brand-text/60 dark:text-gray-400">
          <p className="text-sm">{t('hr.job.noCandidates') || 'Chưa có ứng viên nào ứng tuyển'}</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-brand-secondary dark:text-white flex items-center gap-2">
          <FaUsers size={18} className="text-brand-primary" />
          {t('hr.job.candidates') || 'Ứng viên ứng tuyển'}
        </h2>
      </div>

      <div className="space-y-3">
        {candidates.slice(0, 5).map((candidate, index) => (
          <div
            key={candidate.id || index}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-light/20 dark:hover:bg-gray-700/30 transition-all duration-200 cursor-pointer"
          >
            {/* Avatar */}
            {candidate.avatar ? (
              <img
                src={candidate.avatar.secure_url}
                alt={candidate.name || 'Avatar'}
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-light/30 dark:border-gray-700 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none'
                  const parent = e.target.parentElement
                  const fallback = parent?.querySelector('.fallback-avatar')
                  if (fallback) fallback.classList.remove('hidden')
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 fallback-avatar ${candidate.avatar ? 'hidden' : ''}`}>
              {candidate.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
                {candidate.name}
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400 truncate">
                {candidate.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {candidate.score && (
                <span className={`text-sm font-bold ${
                  candidate.score >= 80 ? 'text-emerald-500' :
                    candidate.score >= 60 ? 'text-blue-500' :
                      candidate.score >= 40 ? 'text-yellow-500' :
                        'text-red-500'
                }`}>
                  {candidate.score}%
                </span>
              )}
              <CandidateStatusBadge status={candidate.status} />
              <Link
                to={`/hr/candidates/${candidate.id}`}
                className="p-1.5 rounded-lg text-brand-text/40 dark:text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 transition-all duration-200"
              >
                <FaEye size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {candidates.length > 5 && (
        <div className="mt-4 pt-4 border-t border-brand-light/50 dark:border-gray-700/50">
          <Link
            to={`/hr/candidates${jobId ? `?jobId=${jobId}` : ''}`}
            className="flex items-center justify-center gap-1 text-sm text-brand-primary hover:underline transition-all duration-200 cursor-pointer"
          >
            {t('hr.job.viewAllCandidates') || 'Xem tất cả ứng viên'}
            <FaChevronRight size={14} />
          </Link>
        </div>
      )}
    </motion.div>
  )
}

export default JobDetailCandidates