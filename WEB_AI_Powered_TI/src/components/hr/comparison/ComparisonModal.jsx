import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTimes,
  FaTrophy,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaMedal,
  FaUser,
  FaEnvelope,
  FaBriefcase,
  FaChartBar,
  FaCode,
  FaUsers,
  FaHeart,
  FaChevronDown,
  FaChevronUp,
  FaLightbulb,
  FaThumbsUp,
  FaThumbsDown,
  FaInfoCircle,
  FaFileAlt
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { comparisonApi } from '~/api/hr/comparison.api'
import { formatCompactNumber } from '~/utils/format'
import { toast } from 'react-toastify'

const ComparisonModal = ({ isOpen, onClose, candidateIds }) => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    scores: true,
    skills: true,
    strengths: false,
    weaknesses: false,
    suggestions: false,
    analysis: false
  })

  useEffect(() => {
    if (isOpen && candidateIds && candidateIds.length >= 2) {
      fetchComparison()
    }
  }, [isOpen, candidateIds])

  const fetchComparison = async () => {
    setIsLoading(true)
    try {
      const response = await comparisonApi.compareCandidates(candidateIds)
      if (response.success) {
        setComparisonData(response.data)
      } else {
        toast.error(response.message || 'Không thể tải dữ liệu so sánh')
      }
    } catch (error) {
      console.error('Comparison error:', error)
      toast.error(error.message || 'Có lỗi xảy ra khi so sánh')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getRankColor = (rank) => {
    switch (rank) {
    case 1: return 'text-yellow-400'
    case 2: return 'text-gray-400'
    case 3: return 'text-amber-600'
    default: return 'text-brand-text/40'
    }
  }

  const getRankIcon = (rank) => {
    switch (rank) {
    case 1: return <FaTrophy className="text-yellow-400" size={20} />
    case 2: return <FaMedal className="text-gray-400" size={18} />
    case 3: return <FaMedal className="text-amber-600" size={18} />
    default: return <span className="text-xs font-bold">#{rank}</span>
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500'
    if (score >= 60) return 'text-blue-500'
    if (score >= 40) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getRecommendationBadge = (recommendation) => {
    if (recommendation === 'hire') {
      return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: FaCheckCircle, label: 'Nên tuyển' }
    } else if (recommendation === 'shortlist') {
      return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FaStar, label: 'Shortlist' }
    } else if (recommendation === 'interview') {
      return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FaUsers, label: 'Nên phỏng vấn' }
    } else {
      return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FaTimesCircle, label: 'Không phù hợp' }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-brand-light/50 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <FaChartBar size={20} className="text-brand-primary" />
                <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
                  {t('hr.comparison.title') || 'So sánh ứng viên'}
                </h2>
                <span className="text-xs px-2 py-1 bg-brand-light/20 dark:bg-gray-700 rounded-full text-brand-text/60 dark:text-gray-400">
                  {candidateIds?.length || 0} {t('hr.comparison.candidates') || 'ứng viên'}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-brand-light/30 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <FaTimes size={18} className="text-brand-text/60 dark:text-gray-400" />
              </button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <FaSpinner className="animate-spin text-brand-primary" size={40} />
                  <p className="text-brand-text/60 dark:text-gray-400">
                    {t('hr.comparison.loading') || 'Đang phân tích so sánh...'}
                  </p>
                </div>
              </div>
            )}

            {/* Content */}
            {!isLoading && comparisonData && (
              <div className="p-6 space-y-6">
                {/* Rankings summary */}
                <div className="bg-gradient-to-r from-brand-primary/5 to-purple-500/5 dark:from-brand-primary/10 dark:to-purple-500/10 rounded-xl p-4 border border-brand-primary/10 dark:border-brand-primary/20">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {t('hr.comparison.bestMatch') || 'Ứng viên phù hợp nhất'}
                      </p>
                      <p className="text-lg font-bold text-brand-secondary dark:text-white">
                        {comparisonData.statistics?.bestMatch?.name}
                      </p>
                      <p className="text-sm text-brand-text/60 dark:text-gray-400">
                        {comparisonData.statistics?.bestMatch?.position} •
                        {t('hr.comparison.score') || 'Điểm'} {comparisonData.statistics?.bestMatch?.score}/100
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.comparison.total') || 'Tổng'}</p>
                        <p className="text-lg font-bold text-brand-secondary dark:text-white">
                          {comparisonData.statistics?.totalCandidates}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.comparison.highest') || 'Cao nhất'}</p>
                        <p className="text-lg font-bold text-emerald-500">{comparisonData.statistics?.maxScore}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-brand-text/40 dark:text-gray-500">{t('hr.comparison.average') || 'Trung bình'}</p>
                        <p className="text-lg font-bold text-blue-500">{comparisonData.statistics?.avgScore}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-gray-800/50">
                        <th className="sticky left-0 z-10 bg-gray-50/50 dark:bg-gray-800/50 px-3 py-2 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 border-b border-brand-light/30 dark:border-gray-700">
                          {t('hr.comparison.criteria') || 'Tiêu chí'}
                        </th>
                        {comparisonData.rankings?.map((candidate, index) => (
                          <th key={candidate.id} className="px-3 py-2 text-center border-b border-brand-light/30 dark:border-gray-700 min-w-[150px]">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                {getRankIcon(index + 1)}
                                <span className={`font-bold ${getRankColor(index + 1)}`}>
                                  #{index + 1}
                                </span>
                              </div>
                              <p className="font-medium text-brand-secondary dark:text-white truncate max-w-[120px]">
                                {candidate.name}
                              </p>
                              <p className="text-xs text-brand-text/40 dark:text-gray-500 truncate max-w-[120px]">
                                {candidate.positionApplied}
                              </p>
                              {/* Recommendation badge */}
                              {candidate.recommendation && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getRecommendationBadge(candidate.recommendation).color}`}>
                                  {getRecommendationBadge(candidate.recommendation).label}
                                </span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Overall Score */}
                      <tr className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-3 py-2.5 text-xs font-semibold text-brand-text/60 dark:text-gray-400 border-b border-brand-light/30 dark:border-gray-700">
                          {t('hr.comparison.overallScore') || 'Điểm tổng quan'}
                        </td>
                        {comparisonData.rankings?.map((candidate) => (
                          <td key={candidate.id} className="px-3 py-2.5 text-center border-b border-brand-light/30 dark:border-gray-700">
                            <span className={`text-lg font-bold ${getScoreColor(candidate.scores?.overall)}`}>
                              {candidate.scores?.overall || 0}
                            </span>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${candidate.scores?.overall || 0}%`,
                                  backgroundColor: candidate.scores?.overall >= 80 ? '#10b981' :
                                    candidate.scores?.overall >= 60 ? '#3b82f6' :
                                      candidate.scores?.overall >= 40 ? '#eab308' : '#ef4444'
                                }}
                              />
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Skills Score */}
                      <tr className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-3 py-2.5 text-xs font-semibold text-brand-text/60 dark:text-gray-400 border-b border-brand-light/30 dark:border-gray-700">
                          {t('hr.comparison.skills') || 'Kỹ năng'}
                        </td>
                        {comparisonData.rankings?.map((candidate) => (
                          <td key={candidate.id} className="px-3 py-2.5 text-center border-b border-brand-light/30 dark:border-gray-700">
                            <span className={`text-sm font-bold ${getScoreColor(candidate.scores?.skillsMatch || 0)}`}>
                              {candidate.scores?.skillsMatch || 0}
                            </span>
                            <div className="flex flex-wrap justify-center gap-1 mt-1">
                              {candidate.skills?.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 rounded truncate max-w-[60px]">
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills?.length > 3 && (
                                <span className="text-[10px] text-brand-text/40 dark:text-gray-500">
                                  +{candidate.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Culture Fit */}
                      <tr className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-3 py-2.5 text-xs font-semibold text-brand-text/60 dark:text-gray-400 border-b border-brand-light/30 dark:border-gray-700">
                          {t('hr.comparison.cultureFit') || 'Văn hóa'}
                        </td>
                        {comparisonData.rankings?.map((candidate) => (
                          <td key={candidate.id} className="px-3 py-2.5 text-center border-b border-brand-light/30 dark:border-gray-700">
                            <span className={`text-sm font-bold ${getScoreColor(candidate.scores?.cultureFit || 0)}`}>
                              {candidate.scores?.cultureFit || 0}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Retention */}
                      <tr className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-3 py-2.5 text-xs font-semibold text-brand-text/60 dark:text-gray-400 border-b border-brand-light/30 dark:border-gray-700">
                          {t('hr.comparison.retention') || 'Gắn bó'}
                        </td>
                        {comparisonData.rankings?.map((candidate) => (
                          <td key={candidate.id} className="px-3 py-2.5 text-center border-b border-brand-light/30 dark:border-gray-700">
                            <span className={`text-sm font-bold ${getScoreColor(candidate.scores?.retention || 0)}`}>
                              {candidate.scores?.retention || 0}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* Status */}
                      <tr className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-3 py-2.5 text-xs font-semibold text-brand-text/60 dark:text-gray-400 border-b border-brand-light/30 dark:border-gray-700">
                          {t('hr.comparison.status') || 'Trạng thái'}
                        </td>
                        {comparisonData.rankings?.map((candidate) => (
                          <td key={candidate.id} className="px-3 py-2.5 text-center border-b border-brand-light/30 dark:border-gray-700">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              candidate.status === 'hired' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                candidate.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  candidate.status === 'shortlisted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    candidate.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                              {t(`hr.candidate.${candidate.status}`) || candidate.status}
                            </span>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Detailed Analysis Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-brand-secondary dark:text-white flex items-center gap-2">
                    <FaInfoCircle size={18} className="text-brand-primary" />
                    {t('hr.comparison.detailedAnalysis') || 'Phân tích chi tiết'}
                  </h3>

                  {comparisonData.rankings?.map((candidate, index) => (
                    <div key={candidate.id} className="border border-brand-light/30 dark:border-gray-700 rounded-xl overflow-hidden">
                      {/* Candidate header */}
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/30 transition-colors"
                        onClick={() => toggleSection(`analysis_${candidate.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${getRankColor(index + 1)}`}>
                            #{index + 1}
                          </span>
                          <span className="font-semibold text-brand-secondary dark:text-white">
                            {candidate.name}
                          </span>
                          <span className="text-sm text-brand-text/60 dark:text-gray-400">
                            {candidate.positionApplied}
                          </span>
                          {candidate.scores?.overall && (
                            <span className={`text-sm font-bold ${getScoreColor(candidate.scores.overall)}`}>
                              {candidate.scores.overall}/100
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {candidate.recommendation && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${getRecommendationBadge(candidate.recommendation).color}`}>
                              {getRecommendationBadge(candidate.recommendation).label}
                            </span>
                          )}
                          {expandedSections[`analysis_${candidate.id}`] ? (
                            <FaChevronUp className="text-brand-text/40" />
                          ) : (
                            <FaChevronDown className="text-brand-text/40" />
                          )}
                        </div>
                      </div>

                      {/* Analysis content */}
                      <AnimatePresence>
                        {expandedSections[`analysis_${candidate.id}`] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-4 space-y-4 border-t border-brand-light/30 dark:border-gray-700"
                          >
                            {/* Summary */}
                            {candidate.analysisSummary && (
                              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100/50 dark:border-blue-900/30">
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                  <FaFileAlt size={12} />
                                  {t('hr.comparison.summary') || 'Tổng quan'}
                                </p>
                                <p className="text-sm text-brand-text dark:text-gray-300 mt-1 leading-relaxed">
                                  {candidate.analysisSummary}
                                </p>
                              </div>
                            )}

                            {/* Strengths */}
                            {candidate.strengths?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                  <FaThumbsUp size={12} />
                                  {t('hr.comparison.strengths') || 'Điểm mạnh'}
                                </p>
                                <ul className="mt-1 space-y-1">
                                  {candidate.strengths.map((item, i) => (
                                    <li key={i} className="text-sm text-brand-text dark:text-gray-300 flex items-start gap-2 pl-4">
                                      <span className="text-emerald-400">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Weaknesses */}
                            {candidate.weaknesses?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1.5">
                                  <FaThumbsDown size={12} />
                                  {t('hr.comparison.weaknesses') || 'Điểm yếu'}
                                </p>
                                <ul className="mt-1 space-y-1">
                                  {candidate.weaknesses.map((item, i) => (
                                    <li key={i} className="text-sm text-brand-text dark:text-gray-300 flex items-start gap-2 pl-4">
                                      <span className="text-red-400">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Suggestions */}
                            {candidate.suggestions?.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                                  <FaLightbulb size={12} />
                                  {t('hr.comparison.suggestions') || 'Gợi ý cải thiện'}
                                </p>
                                <ul className="mt-1 space-y-1">
                                  {candidate.suggestions.map((item, i) => (
                                    <li key={i} className="text-sm text-brand-text dark:text-gray-300 flex items-start gap-2 pl-4">
                                      <span className="text-blue-400">•</span>
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                {comparisonData.recommendation && (
                  <div className="bg-gradient-to-r from-brand-primary/5 to-purple-500/5 dark:from-brand-primary/10 dark:to-purple-500/10 rounded-xl p-4 border border-brand-primary/20 dark:border-brand-primary/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-brand-primary/20 text-brand-primary flex-shrink-0">
                        <FaTrophy size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-brand-secondary dark:text-white">
                          {t('hr.comparison.recommendation') || 'Gợi ý'}
                        </p>
                        <p className="text-sm text-brand-text dark:text-gray-300 mt-1">
                          {comparisonData.recommendation.summary}
                        </p>
                        <p className="text-sm text-brand-text/70 dark:text-gray-400 mt-1">
                          {comparisonData.recommendation.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Close button */}
                <div className="flex items-center justify-end pt-4 border-t border-brand-light/50 dark:border-gray-700">
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    {t('common.close') || 'Đóng'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ComparisonModal