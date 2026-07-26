import { motion } from 'framer-motion'
import { FaStar, FaCode, FaUsers, FaHeart, FaCheckCircle, FaTimesCircle, FaLightbulb, FaThumbsUp, FaThumbsDown } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

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

const getScoreColor = (score) => {
  if (score >= 80) return 'text-emerald-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  return 'text-red-500'
}

const getScoreBg = (score) => {
  if (score >= 80) return 'bg-emerald-50 dark:bg-emerald-950/20'
  if (score >= 60) return 'bg-blue-50 dark:bg-blue-950/20'
  if (score >= 40) return 'bg-yellow-50 dark:bg-yellow-950/20'
  return 'bg-red-50 dark:bg-red-950/20'
}

const getRecommendationBadge = (recommendation) => {
  if (recommendation === 'shortlist') {
    return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FaCheckCircle, label: 'Shortlist' }
  } else if (recommendation === 'need_more_info') {
    return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: FaLightbulb, label: 'Cần thêm thông tin' }
  } else {
    return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FaTimesCircle, label: 'Không phù hợp' }
  }
}

const AnalyticsResult = ({ analysis, enrichment, isLoading }) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-8 border border-brand-light/30 dark:border-gray-700/50"
      >
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-4">
            <FaSpinner className="animate-spin text-brand-primary" size={40} />
            <p className="text-brand-text/60 dark:text-gray-400">
              {t('hr.analytics.loadingResult') || 'Đang tải kết quả phân tích...'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (!analysis) {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-8 text-center border border-brand-light/30 dark:border-gray-700/50"
      >
        <div className="text-brand-text/40 dark:text-gray-500 text-4xl mb-4">📊</div>
        <p className="text-brand-text/60 dark:text-gray-400">
          {t('hr.analytics.noResult') || 'Chưa có kết quả phân tích. Hãy chọn ứng viên và nhấn "Phân tích CV".'}
        </p>
      </motion.div>
    )
  }

  // Parse analysis result
  let result = {}
  try {
    result = typeof analysis.result === 'string' ? JSON.parse(analysis.result) : analysis.result
  } catch {
    result = {}
  }

  const overall = result.overall || {}
  const skillsMatch = result.skills_match || {}
  const cultureFit = result.culture_fit || {}
  const retention = result.retention || {}

  const recommendation = getRecommendationBadge(overall.recommendation)

  return (
    <motion.div
      variants={itemVariants}
      className="space-y-6"
    >
      {/* Overall Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-brand-text/60 dark:text-gray-400">
              {t('hr.analytics.overallScore') || 'Điểm tổng quan'}
            </p>
            <div className="flex items-center gap-3">
              <span className={`text-3xl font-bold ${getScoreColor(overall.score || 0)}`}>
                {overall.score || 0}/100
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${recommendation.color}`}>
                <recommendation.icon className="inline mr-1" size={12} />
                {recommendation.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                size={20}
                className={i < Math.round((overall.score || 0) / 20) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
              />
            ))}
          </div>
        </div>
        {overall.summary && (
          <p className="mt-3 text-sm text-brand-text dark:text-gray-300">{overall.summary}</p>
        )}
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getScoreBg(skillsMatch.score || 0)}`}>
              <FaCode size={16} className={getScoreColor(skillsMatch.score || 0)} />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-secondary dark:text-white">
                {skillsMatch.score || 0}%
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {t('hr.analytics.skillsMatch') || 'Kỹ năng'}
              </p>
            </div>
          </div>
          {skillsMatch.matched_skills?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {skillsMatch.matched_skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded">
                  {skill}
                </span>
              ))}
              {skillsMatch.matched_skills.length > 3 && (
                <span className="text-[10px] text-brand-text/40 dark:text-gray-500">
                  +{skillsMatch.matched_skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getScoreBg(cultureFit.score || 0)}`}>
              <FaUsers size={16} className={getScoreColor(cultureFit.score || 0)} />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-secondary dark:text-white">
                {cultureFit.score || 0}%
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {t('hr.analytics.cultureFit') || 'Văn hóa'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${getScoreBg(retention.score || 0)}`}>
              <FaHeart size={16} className={getScoreColor(retention.score || 0)} />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-secondary dark:text-white">
                {retention.score || 0}%
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {t('hr.analytics.retention') || 'Gắn bó'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {overall.strengths?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-emerald-200 dark:border-emerald-800/50">
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
              <FaThumbsUp size={14} />
              {t('hr.analytics.strengths') || 'Điểm mạnh'}
            </p>
            <ul className="space-y-1">
              {overall.strengths.map((item, i) => (
                <li key={i} className="text-sm text-brand-text dark:text-gray-300 flex items-start gap-2">
                  <span className="text-emerald-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {overall.weaknesses?.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-red-200 dark:border-red-800/50">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
              <FaThumbsDown size={14} />
              {t('hr.analytics.weaknesses') || 'Điểm yếu'}
            </p>
            <ul className="space-y-1">
              {overall.weaknesses.map((item, i) => (
                <li key={i} className="text-sm text-brand-text dark:text-gray-300 flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {skillsMatch.suggestions?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-blue-200 dark:border-blue-800/50">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
            <FaLightbulb size={14} />
            {t('hr.analytics.suggestions') || 'Gợi ý cải thiện'}
          </p>
          <ul className="space-y-1">
            {skillsMatch.suggestions.map((item, i) => (
              <li key={i} className="text-sm text-brand-text dark:text-gray-300 flex items-start gap-2">
                <span className="text-blue-400">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enrichment Data */}
      {enrichment && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-purple-200 dark:border-purple-800/50">
          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-3">
            <FaChartLine size={14} />
            {t('hr.analytics.enrichmentData') || 'Phân tích nâng cao'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.analytics.promotionSpeed') || 'Tốc độ thăng tiến'}</p>
              <p className="text-sm font-semibold text-brand-secondary dark:text-white">{enrichment.promotion_speed || 0}%</p>
            </div>
            <div>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.analytics.gapMonths') || 'Khoảng trống nghỉ việc'}</p>
              <p className="text-sm font-semibold text-brand-secondary dark:text-white">{enrichment.gap_months || 0} tháng</p>
            </div>
            <div>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.analytics.achievementScore') || 'Điểm thành tích'}</p>
              <p className="text-sm font-semibold text-brand-secondary dark:text-white">{enrichment.achievement_detail_score || 0}/100</p>
            </div>
            <div>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.analytics.skillDiversity') || 'Đa dạng kỹ năng'}</p>
              <p className="text-sm font-semibold text-brand-secondary dark:text-white">{enrichment.skill_diversity_score || 0}%</p>
            </div>
          </div>
          {enrichment.career_progression_summary && (
            <p className="mt-2 text-xs text-brand-text/60 dark:text-gray-400">
              {enrichment.career_progression_summary}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default AnalyticsResult