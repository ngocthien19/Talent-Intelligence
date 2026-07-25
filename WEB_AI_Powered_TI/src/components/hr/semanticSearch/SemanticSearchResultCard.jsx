import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaStar, FaEnvelope, FaBriefcase, FaPhone, FaCalendarAlt, FaUsers, FaHeart } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CandidateStatusBadge from '~/components/hr/candidate/CandidateStatusBadge'
import { formatDate } from '~/utils/format'

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

const getSimilarityColor = (similarity) => {
  if (similarity >= 0.8) return 'text-emerald-500'
  if (similarity >= 0.6) return 'text-blue-500'
  if (similarity >= 0.4) return 'text-yellow-500'
  return 'text-red-500'
}

const getSimilarityBg = (similarity) => {
  if (similarity >= 0.8) return 'bg-emerald-100 dark:bg-emerald-950/30'
  if (similarity >= 0.6) return 'bg-blue-100 dark:bg-blue-950/30'
  if (similarity >= 0.4) return 'bg-yellow-100 dark:bg-yellow-950/30'
  return 'bg-red-100 dark:bg-red-950/30'
}

const SemanticSearchResultCard = ({ result, index }) => {
  const { t } = useLanguage()

  // Lấy skills từ parsed_data hoặc skills array
  const skills = result.parsed_data?.skills || result.skills || []

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
    >
      <div className="p-4">
        {/* Header - Avatar & Name */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {result.avatar?.secure_url ? (
              <img
                src={result.avatar.secure_url}
                alt={result.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-brand-light/30 dark:border-gray-700 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {result.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-brand-secondary dark:text-white truncate">
                {result.name}
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400 truncate">
                {result.position_applied}
              </p>
            </div>
          </div>
          {/* Similarity Badge */}
          <div className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getSimilarityBg(result.similarity)} ${getSimilarityColor(result.similarity)}`}>
            {Math.round(result.similarity * 100)}% match
          </div>
        </div>

        {/* Scores - Overall, Skills, Culture, Retention */}
        <div className="grid grid-cols-2 gap-1 mt-3">
          <div className="flex items-center gap-1">
            <FaStar size={12} className="text-yellow-400" />
            <span className="text-xs text-brand-text/60 dark:text-gray-400">Overall</span>
            <span className={`text-xs font-bold ml-auto ${getScoreColor(result.overall_score)}`}>
              {result.overall_score || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaBriefcase size={12} className="text-blue-400" />
            <span className="text-xs text-brand-text/60 dark:text-gray-400">Skills</span>
            <span className={`text-xs font-bold ml-auto ${getScoreColor(result.skills_match_score || 0)}`}>
              {result.skills_match_score || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaUsers size={12} className="text-purple-400" />
            <span className="text-xs text-brand-text/60 dark:text-gray-400">Culture</span>
            <span className={`text-xs font-bold ml-auto ${getScoreColor(result.culture_fit_score || 0)}`}>
              {result.culture_fit_score || 0}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <FaHeart size={12} className="text-red-400" />
            <span className="text-xs text-brand-text/60 dark:text-gray-400">Retention</span>
            <span className={`text-xs font-bold ml-auto ${getScoreColor(result.retention_score || 0)}`}>
              {result.retention_score || 0}
            </span>
          </div>
        </div>

        {/* Info - Email, Phone, Created Date */}
        <div className="mt-3 space-y-1">
          {result.email && (
            <div className="flex items-center gap-1.5 text-xs text-brand-text/40 dark:text-gray-500">
              <FaEnvelope size={10} />
              <span className="truncate">{result.email}</span>
            </div>
          )}
          {result.phone && (
            <div className="flex items-center gap-1.5 text-xs text-brand-text/40 dark:text-gray-500">
              <FaPhone size={10} />
              <span>{result.phone}</span>
            </div>
          )}
          {result.created_at && (
            <div className="flex items-center gap-1.5 text-xs text-brand-text/40 dark:text-gray-500">
              <FaCalendarAlt size={10} />
              <span>{t('hr.search.appliedOn') || 'Ứng tuyển'}: {formatDate(new Date(result.created_at))}</span>
            </div>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 4).map((skill, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 rounded truncate max-w-[100px]">
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-[10px] text-brand-text/40 dark:text-gray-500">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer - Status & View Detail */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-light/30 dark:border-gray-700/50">
          <CandidateStatusBadge status={result.status} />
          <Link
            to={`/hr/applications/${result.application_id}`}
            className="text-xs font-medium text-brand-primary hover:underline transition-colors flex items-center gap-1"
          >
            {t('hr.search.viewDetail') || 'Xem chi tiết'}
            <span className="text-brand-primary/60">→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default SemanticSearchResultCard