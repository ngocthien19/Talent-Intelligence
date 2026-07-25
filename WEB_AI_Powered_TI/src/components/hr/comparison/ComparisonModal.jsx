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
  FaChevronUp
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { comparisonApi } from '~/api/hr/comparison.api'
import { formatCompactNumber } from '~/utils/format'

const ComparisonModal = ({ isOpen, onClose, candidateIds }) => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState(null)
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    skills: true,
    scores: true,
    analysis: true
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
    default: return <span className="text-xs font-bold">{rank}</span>
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

            {/* Loading state */}
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
                <div className="bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-4">
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
                        {comparisonData.comparison?.map((candidate, index) => (
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
                        {comparisonData.comparison?.map((candidate) => (
                          <td key={candidate.id} className="px-3 py-2.5 text-center border-b border-brand-light/30 dark:border-gray-700">
                            <span className={`text-lg font-bold ${getScoreColor(candidate.scores?.overall)}`}>
                              {candidate.scores?.overall || 0}
                            </span>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                              <div
                                className={'h-full rounded-full transition-all duration-500'}
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
                        {comparisonData.comparison?.map((candidate) => (
                          <td key={candidate.id} className="px-3 py-2.5 text-center border-b border-brand-light/30 dark:border-gray-700">
                            <span className={`text-sm font-bold ${getScoreColor(candidate.scores?.skillsMatch || 0)}`}>
                              {candidate.scores?.skillsMatch || 0}
                            </span>
                            <div className="flex flex-wrap justify-center gap-1 mt-1">
                              {candidate.skills?.slice(0, 3).map((skill, i) => (
                                <span key={i} className="text-[10px] px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 rounded">
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
                        {comparisonData.comparison?.map((candidate) => (
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
                        {comparisonData.comparison?.map((candidate) => (
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
                        {comparisonData.comparison?.map((candidate) => (
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

                {/* Recommendation */}
                {comparisonData.recommendation && (
                  <div className="bg-brand-primary/5 dark:bg-brand-primary/10 rounded-xl p-4 border border-brand-primary/20 dark:border-brand-primary/30">
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