import { motion } from 'framer-motion'
import { FaChartLine, FaCode, FaUsers, FaHeart } from 'react-icons/fa'
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

const CandidateDetailStats = ({ candidate }) => {
  const { t } = useLanguage()

  const stats = [
    {
      key: 'overall_score',
      label: t('hr.overallScore') || 'Điểm tổng quan',
      value: candidate.overall_score || 0,
      icon: FaChartLine,
      color: getScoreColor(candidate.overall_score || 0),
      bg: getScoreBg(candidate.overall_score || 0)
    },
    {
      key: 'skills_match_score',
      label: t('hr.skillsScore') || 'Kỹ năng',
      value: candidate.skills_match_score || 0,
      icon: FaCode,
      color: getScoreColor(candidate.skills_match_score || 0),
      bg: getScoreBg(candidate.skills_match_score || 0)
    },
    {
      key: 'culture_fit_score',
      label: t('hr.cultureScore') || 'Văn hóa',
      value: candidate.culture_fit_score || 0,
      icon: FaUsers,
      color: getScoreColor(candidate.culture_fit_score || 0),
      bg: getScoreBg(candidate.culture_fit_score || 0)
    },
    {
      key: 'retention_score',
      label: t('hr.retentionScore') || 'Gắn bó',
      value: candidate.retention_score || 0,
      icon: FaHeart,
      color: getScoreColor(candidate.retention_score || 0),
      bg: getScoreBg(candidate.retention_score || 0)
    }
  ]

  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <Icon size={16} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-secondary dark:text-white">
                  {stat.value}%
                </p>
                <p className="text-xs text-brand-text/60 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={'h-full rounded-full transition-all duration-500'}
                style={{
                  width: `${stat.value}%`,
                  backgroundColor: stat.value >= 80 ? '#10b981' : stat.value >= 60 ? '#3b82f6' : stat.value >= 40 ? '#eab308' : '#ef4444'
                }}
              />
            </div>
          </div>
        )
      })}
    </motion.div>
  )
}

export default CandidateDetailStats