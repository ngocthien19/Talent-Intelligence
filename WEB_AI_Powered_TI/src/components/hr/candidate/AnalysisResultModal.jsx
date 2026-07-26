import { motion, AnimatePresence } from 'framer-motion'
import {
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane,
  FaChartLine,
  FaBrain,
  FaBriefcaseMedical,
  FaLayerGroup,
  FaCode,
  FaExclamationTriangle
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const ScoreBadge = ({ score, size = 'md' }) => {
  const getColor = (s) => {
    if (s >= 80) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
    if (s >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
    if (s >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
    return 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
  }
  const sizeClass = size === 'lg' ? 'text-2xl px-4 py-1.5' : 'text-sm px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-bold ${sizeClass} ${getColor(score ?? 0)}`}>
      {score ?? '--'}<span className="text-xs font-normal opacity-70">/100</span>
    </span>
  )
}

const RECOMMENDATION_CONFIG = {
  shortlist: { label: 'Đề xuất chọn', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' },
  reject: { label: 'Đề xuất loại', color: 'text-red-600 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' },
  need_more_info: { label: 'Cần thêm thông tin', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800' }
}

const Section = ({ icon: Icon, title, children }) => (
  <div className="space-y-2">
    <h4 className="flex items-center gap-2 text-sm font-semibold text-brand-secondary dark:text-white">
      <Icon size={14} className="text-brand-primary" />
      {title}
    </h4>
    <div className="pl-6">{children}</div>
  </div>
)

const ChipList = ({ items, tone = 'default' }) => {
  if (!items || items.length === 0) return <p className="text-xs text-brand-text/50 dark:text-gray-500">Không có</p>
  const toneClass = tone === 'positive'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
    : tone === 'negative'
      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
      : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`text-xs px-2 py-1 rounded-full border ${toneClass}`}>
          {item}
        </span>
      ))}
    </div>
  )
}

const AnalysisResultModal = ({
  isOpen,
  onClose,
  candidate,
  data,
  onSendReport,
  isSendingReport = false
}) => {
  const { t } = useLanguage()

  if (!isOpen || !candidate) return null

  const { analysis, enrichment, reportSent, isLoading } = data || {}

  // analysis.result là jsonb, phòng trường hợp trả về dạng string thì parse lại
  const result = analysis?.result
    ? (typeof analysis.result === 'string' ? JSON.parse(analysis.result) : analysis.result)
    : null

  const recommendation = result?.overall?.recommendation
  const recommendationConfig = RECOMMENDATION_CONFIG[recommendation]

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-light/50 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div>
                <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
                  {t('hr.candidate.analysisResult') || 'Kết quả phân tích'}
                </h2>
                <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-0.5">
                  {candidate.name} — {candidate.position_applied || candidate.position}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-brand-light/30 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer flex-shrink-0"
              >
                <FaTimes size={18} className="text-brand-text/60 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <FaSpinner className="animate-spin text-brand-primary" size={32} />
                  <p className="text-sm text-brand-text/60 dark:text-gray-400">
                    {t('hr.candidate.analyzing') || 'Đang phân tích, quá trình này có thể mất khoảng 30-60 giây...'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Overall */}
                  {result?.overall ? (
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h3 className="text-sm font-semibold text-brand-secondary dark:text-white uppercase tracking-wider">
                          {t('hr.candidate.overallAssessment') || 'Đánh giá tổng quan'}
                        </h3>
                        <div className="flex items-center gap-2">
                          {recommendationConfig && (
                            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${recommendationConfig.color}`}>
                              {recommendationConfig.label}
                            </span>
                          )}
                          <ScoreBadge score={result.overall.score} size="lg" />
                        </div>
                      </div>
                      {result.overall.summary && (
                        <p className="text-sm text-brand-text dark:text-gray-300">{result.overall.summary}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div>
                          <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mb-1.5">
                            {t('hr.candidate.strengths') || 'Điểm mạnh'}
                          </p>
                          <ChipList items={result.overall.strengths} tone="positive" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mb-1.5">
                            {t('hr.candidate.weaknesses') || 'Điểm yếu'}
                          </p>
                          <ChipList items={result.overall.weaknesses} tone="negative" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-brand-text/50 dark:text-gray-500 py-4">
                      <FaExclamationTriangle size={14} />
                      {t('hr.candidate.noBasicAnalysis') || 'Chưa có kết quả phân tích cơ bản'}
                    </div>
                  )}

                  {result && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Skills match */}
                      <div className="p-4 border border-brand-light/30 dark:border-gray-700/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase">
                            {t('hr.candidate.skillsMatch') || 'Phù hợp kỹ năng'}
                          </span>
                          <ScoreBadge score={result.skills_match?.score} />
                        </div>
                        <div>
                          <p className="text-[11px] text-brand-text/50 dark:text-gray-500 mb-1">
                            {t('hr.candidate.matchedSkills') || 'Kỹ năng khớp'}
                          </p>
                          <ChipList items={result.skills_match?.matched_skills} tone="positive" />
                        </div>
                        <div>
                          <p className="text-[11px] text-brand-text/50 dark:text-gray-500 mb-1">
                            {t('hr.candidate.missingSkills') || 'Kỹ năng còn thiếu'}
                          </p>
                          <ChipList items={result.skills_match?.missing_skills} tone="negative" />
                        </div>
                      </div>

                      {/* Culture fit */}
                      <div className="p-4 border border-brand-light/30 dark:border-gray-700/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase">
                            {t('hr.candidate.cultureFit') || 'Phù hợp văn hóa'}
                          </span>
                          <ScoreBadge score={result.culture_fit?.score} />
                        </div>
                        {result.culture_fit?.analysis && (
                          <p className="text-xs text-brand-text dark:text-gray-300">{result.culture_fit.analysis}</p>
                        )}
                      </div>

                      {/* Retention */}
                      <div className="p-4 border border-brand-light/30 dark:border-gray-700/50 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase">
                            {t('hr.candidate.retention') || 'Khả năng gắn bó'}
                          </span>
                          <ScoreBadge score={result.retention?.score} />
                        </div>
                        {result.retention?.advice && (
                          <p className="text-xs text-brand-text dark:text-gray-300">{result.retention.advice}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enrichment (nâng cao) */}
                  <div className="pt-2 border-t border-brand-light/30 dark:border-gray-700/50 space-y-4">
                    <h3 className="text-sm font-semibold text-brand-secondary dark:text-white uppercase tracking-wider pt-4">
                      {t('hr.candidate.advancedAnalysis') || 'Phân tích nâng cao'}
                    </h3>

                    {enrichment ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl text-center">
                            <p className="text-lg font-bold text-brand-secondary dark:text-white">{enrichment.promotion_speed ?? 0}%</p>
                            <p className="text-[11px] text-brand-text/60 dark:text-gray-400 mt-0.5">
                              {t('hr.candidate.promotionSpeed') || 'Tốc độ thăng tiến'}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl text-center">
                            <p className="text-lg font-bold text-brand-secondary dark:text-white">{enrichment.gap_months ?? 0}</p>
                            <p className="text-[11px] text-brand-text/60 dark:text-gray-400 mt-0.5">
                              {t('hr.candidate.gapMonths') || 'Tháng nghỉ giữa các công việc'}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl text-center">
                            <p className="text-lg font-bold text-brand-secondary dark:text-white">{enrichment.achievement_detail_score ?? 0}</p>
                            <p className="text-[11px] text-brand-text/60 dark:text-gray-400 mt-0.5">
                              {t('hr.candidate.achievementScore') || 'Độ chi tiết thành tích'}
                            </p>
                          </div>
                          <div className="p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl text-center">
                            <p className="text-lg font-bold text-brand-secondary dark:text-white">{enrichment.skill_diversity_score ?? 0}</p>
                            <p className="text-[11px] text-brand-text/60 dark:text-gray-400 mt-0.5">
                              {t('hr.candidate.skillDiversity') || 'Đa dạng kỹ năng'}
                            </p>
                          </div>
                        </div>

                        {enrichment.tech_stack?.length > 0 && (
                          <Section icon={FaCode} title={t('hr.candidate.techStack') || 'Công nghệ sử dụng'}>
                            <div className="space-y-2">
                              {enrichment.tech_stack.map((group, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span className="text-xs font-medium text-brand-text/60 dark:text-gray-400 min-w-[110px]">
                                    {group.category}
                                  </span>
                                  <ChipList items={group.skills} />
                                </div>
                              ))}
                            </div>
                          </Section>
                        )}

                        {enrichment.career_progression_summary && (
                          <Section icon={FaLayerGroup} title={t('hr.candidate.careerSummary') || 'Tóm tắt lộ trình sự nghiệp'}>
                            <p className="text-sm text-brand-text dark:text-gray-300">
                              {enrichment.career_progression_summary}
                            </p>
                          </Section>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-brand-text/50 dark:text-gray-500 py-2">
                        <FaExclamationTriangle size={14} />
                        {t('hr.candidate.noAdvancedAnalysis') || 'Chưa có kết quả phân tích nâng cao'}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer - Report action */}
            {!isLoading && (
              <div className="flex items-center justify-between gap-3 p-6 border-t border-brand-light/50 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-900">
                {reportSent ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2 rounded-lg">
                    <FaCheckCircle size={14} />
                    {t('hr.candidate.reportAlreadySent') || 'Đã gửi báo cáo cho ứng viên'}
                  </span>
                ) : (
                  <span className="text-xs text-brand-text/50 dark:text-gray-500">
                    {t('hr.candidate.reportNotSentYet') || 'Chưa gửi báo cáo cho ứng viên này'}
                  </span>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    {t('common.close') || 'Đóng'}
                  </button>
                  {!reportSent && (
                    <button
                      onClick={() => onSendReport(candidate.id)}
                      disabled={isSendingReport || !result}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSendingReport ? (
                        <FaSpinner className="animate-spin" size={14} />
                      ) : (
                        <FaPaperPlane size={14} />
                      )}
                      {t('hr.candidate.sendReport') || 'Gửi báo cáo'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default AnalysisResultModal