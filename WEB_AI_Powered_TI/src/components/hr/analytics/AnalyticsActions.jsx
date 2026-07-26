import { motion } from 'framer-motion'
import { FaFileAlt, FaChartLine, FaEnvelope, FaSpinner } from 'react-icons/fa'
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

const AnalyticsActions = ({
  selectedCandidate,
  onAnalyze,
  onEnrich,
  onSendReport,
  isAnalyzing,
  isEnriching,
  isSending,
  hasAnalysis,
  hasEnrichment,
  hasReportSent
}) => {
  const { t } = useLanguage()

  if (!selectedCandidate) {
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-8 text-center border border-brand-light/30 dark:border-gray-700/50"
      >
        <div className="text-brand-text/40 dark:text-gray-500 text-4xl mb-4">🔍</div>
        <p className="text-brand-text/60 dark:text-gray-400">
          {t('hr.analytics.selectCandidate') || 'Vui lòng chọn ứng viên để bắt đầu phân tích'}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50"
    >
      <h3 className="text-sm font-semibold text-brand-secondary dark:text-white mb-4">
        {t('hr.analytics.actions') || 'Thao tác phân tích'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Phân tích CV */}
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            hasAnalysis
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
              : 'border-brand-light/50 dark:border-gray-700 hover:border-brand-primary hover:bg-brand-light/5 dark:hover:bg-gray-800/50'
          } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasAnalysis ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-brand-light/20 dark:bg-gray-700/30'}`}>
              {isAnalyzing ? (
                <FaSpinner className="animate-spin text-brand-primary" size={18} />
              ) : (
                <FaFileAlt size={18} className={hasAnalysis ? 'text-emerald-500' : 'text-brand-text/60 dark:text-gray-400'} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">
                {t('hr.analytics.analyzeCV') || 'Phân tích CV'}
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {hasAnalysis
                  ? t('hr.analytics.analyzed') || 'Đã phân tích'
                  : t('hr.analytics.notAnalyzed') || 'Chưa phân tích'}
              </p>
            </div>
          </div>
          {hasAnalysis && (
            <span className="mt-2 inline-block text-xs font-medium text-emerald-500">
              ✓ {t('hr.analytics.completed') || 'Hoàn thành'}
            </span>
          )}
        </button>

        {/* Phân tích nâng cao */}
        <button
          onClick={onEnrich}
          disabled={isEnriching || !hasAnalysis}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            !hasAnalysis
              ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
              : hasEnrichment
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                : 'border-brand-light/50 dark:border-gray-700 hover:border-purple-500 hover:bg-brand-light/5 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasEnrichment ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-brand-light/20 dark:bg-gray-700/30'}`}>
              {isEnriching ? (
                <FaSpinner className="animate-spin text-brand-primary" size={18} />
              ) : (
                <FaChartLine size={18} className={hasEnrichment ? 'text-purple-500' : 'text-brand-text/60 dark:text-gray-400'} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">
                {t('hr.analytics.enrich') || 'Phân tích nâng cao'}
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {!hasAnalysis
                  ? t('hr.analytics.requireAnalysis') || 'Cần phân tích CV trước'
                  : hasEnrichment
                    ? t('hr.analytics.completed') || 'Hoàn thành'
                    : t('hr.analytics.notEnriched') || 'Chưa phân tích'}
              </p>
            </div>
          </div>
          {hasEnrichment && (
            <span className="mt-2 inline-block text-xs font-medium text-purple-500">
              ✓ {t('hr.analytics.completed') || 'Hoàn thành'}
            </span>
          )}
        </button>

        {/* Gửi báo cáo */}
        <button
          onClick={onSendReport}
          disabled={isSending || !hasAnalysis}
          className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
            !hasAnalysis
              ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
              : hasReportSent
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-brand-light/50 dark:border-gray-700 hover:border-blue-500 hover:bg-brand-light/5 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${hasReportSent ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-brand-light/20 dark:bg-gray-700/30'}`}>
              {isSending ? (
                <FaSpinner className="animate-spin text-brand-primary" size={18} />
              ) : (
                <FaEnvelope size={18} className={hasReportSent ? 'text-blue-500' : 'text-brand-text/60 dark:text-gray-400'} />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">
                {t('hr.analytics.sendReport') || 'Gửi báo cáo'}
              </p>
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {!hasAnalysis
                  ? t('hr.analytics.requireAnalysis') || 'Cần phân tích CV trước'
                  : hasReportSent
                    ? t('hr.analytics.sent') || 'Đã gửi'
                    : t('hr.analytics.notSent') || 'Chưa gửi'}
              </p>
            </div>
          </div>
          {hasReportSent && (
            <span className="mt-2 inline-block text-xs font-medium text-blue-500">
              ✓ {t('hr.analytics.sent') || 'Đã gửi'}
            </span>
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default AnalyticsActions