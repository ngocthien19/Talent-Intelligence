import { Link } from 'react-router-dom'
import { FaClock, FaCheckCircle, FaTimesCircle, FaUserPlus } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const RecentCandidates = ({ candidates, className = '' }) => {
  const { t } = useLanguage()
  const hasCandidates = Array.isArray(candidates) && candidates.length > 0

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white flex items-center gap-2">
          <FaClock size={18} className="text-brand-primary" />
          {t('hr.recentCandidates')}
        </h2>
        <Link to="/hr/candidates" className="text-xs md:text-sm text-brand-primary hover:underline transition-all duration-200 cursor-pointer hover:scale-105">
          {t('hr.viewAll')}
        </Link>
      </div>
      <div className="space-y-3">
        {hasCandidates ? (
          candidates.slice(0, 5).map((candidate, index) => (
            <div
              key={candidate.id || index}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-brand-light/20 dark:hover:bg-gray-700/30 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            >
              <div className={`p-2 rounded-xl ${
                candidate.status === 'hired' ? 'bg-green-50 dark:bg-green-950/20' :
                  candidate.status === 'rejected' ? 'bg-red-50 dark:bg-red-950/20' :
                    'bg-blue-50 dark:bg-blue-950/20'
              }`}>
                {candidate.status === 'hired' ? (
                  <FaCheckCircle size={14} className="text-green-500" />
                ) : candidate.status === 'rejected' ? (
                  <FaTimesCircle size={14} className="text-red-500" />
                ) : (
                  <FaUserPlus size={14} className="text-blue-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
                  {candidate.name || 'Ứng viên'}
                </p>
                <p className="text-xs text-brand-text/60 dark:text-gray-400 truncate">
                  {candidate.position_applied || candidate.job_title || 'Vị trí chưa xác định'}
                </p>
              </div>
              <span className="text-xs text-brand-text/40 dark:text-gray-500 flex-shrink-0">
                {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('vi-VN') : ''}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-brand-text/60 dark:text-gray-400">
            <p className="text-sm">{t('common.noData')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentCandidates