import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner, FaFileAlt, FaChartLine, FaEnvelope, FaCheckCircle, FaTimesCircle, FaUser } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CandidateStatusBadge from '~/components/hr/candidate/CandidateStatusBadge'
import { formatDate } from '~/utils/format'

const AnalyticsTable = ({
  candidates,
  isLoading,
  onAnalyze,
  onEnrich,
  onSendReport,
  analyzingId,
  enrichingId,
  sendingId,
  analyzedIds,
  enrichedIds,
  sentIds
}) => {
  const { t } = useLanguage()

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <FaSpinner className="animate-spin text-brand-primary" size={32} />
            <p className="text-brand-text/60 dark:text-gray-400">
              {t('common.loading') || 'Đang tải...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-12 text-center border border-brand-light/30 dark:border-gray-700/50">
        <div className="text-brand-text/40 dark:text-gray-500 text-4xl mb-4">🎉</div>
        <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">
          {t('hr.analytics.allAnalyzed') || 'Tất cả ứng viên đã được phân tích'}
        </h3>
        <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">
          {t('hr.analytics.noCandidatesWaiting') || 'Không có ứng viên nào đang chờ phân tích'}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-brand-light/30 dark:border-gray-700/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                {t('hr.candidate.name') || 'Ứng viên'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                {t('hr.candidate.position') || 'Vị trí'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                {t('hr.candidate.status') || 'Trạng thái'}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                {t('hr.candidate.date') || 'Ngày ứng tuyển'}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                {t('hr.analytics.actions') || 'Thao tác'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-light/30 dark:divide-gray-700/50">
            {candidates.map((candidate, index) => {
              const isAnalyzed = analyzedIds.includes(candidate.id)
              const isEnriched = enrichedIds.includes(candidate.id)
              const isSent = sentIds.includes(candidate.id)

              return (
                <motion.tr
                  key={candidate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors duration-150"
                >
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {candidate.avatar?.secure_url ? (
                        <img
                          src={candidate.avatar.secure_url}
                          alt={candidate.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-brand-light/30 dark:border-gray-700 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {candidate.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-brand-secondary dark:text-white">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-brand-text/60 dark:text-gray-400">
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-4 py-3">
                    <p className="text-brand-text dark:text-gray-300">
                      {candidate.position_applied || candidate.position || '--'}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <CandidateStatusBadge status={candidate.status} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3">
                    <p className="text-xs text-brand-text/60 dark:text-gray-400">
                      {candidate.created_at ? formatDate(new Date(candidate.created_at)) : '--'}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Analyze CV */}
                      <button
                        onClick={() => onAnalyze(candidate.id)}
                        disabled={isAnalyzed || analyzingId === candidate.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          isAnalyzed
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                            : analyzingId === candidate.id
                              ? 'bg-brand-light/30 dark:bg-gray-700/30 text-brand-text/60 dark:text-gray-400 cursor-wait'
                              : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white dark:bg-brand-primary/20 dark:text-brand-light dark:hover:bg-brand-primary dark:hover:text-white cursor-pointer hover:scale-105'
                        }`}
                      >
                        {analyzingId === candidate.id ? (
                          <FaSpinner className="animate-spin" size={12} />
                        ) : (
                          <FaFileAlt size={12} />
                        )}
                        {isAnalyzed ? t('hr.analytics.done') || 'Đã xong' : t('hr.analytics.analyze') || 'Phân tích'}
                      </button>

                      {/* Enrich */}
                      <button
                        onClick={() => onEnrich(candidate.id)}
                        disabled={!isAnalyzed || isEnriched || enrichingId === candidate.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          !isAnalyzed
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                            : isEnriched
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 cursor-default'
                              : enrichingId === candidate.id
                                ? 'bg-brand-light/30 dark:bg-gray-700/30 text-brand-text/60 dark:text-gray-400 cursor-wait'
                                : 'bg-purple-100 text-purple-600 hover:bg-purple-600 hover:text-white dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-600 dark:hover:text-white cursor-pointer hover:scale-105'
                        }`}
                      >
                        {enrichingId === candidate.id ? (
                          <FaSpinner className="animate-spin" size={12} />
                        ) : (
                          <FaChartLine size={12} />
                        )}
                        {isEnriched ? t('hr.analytics.done') || 'Đã xong' : t('hr.analytics.enrich') || 'Nâng cao'}
                      </button>

                      {/* Send Report */}
                      <button
                        onClick={() => onSendReport(candidate.id)}
                        disabled={!isAnalyzed || isSent || sendingId === candidate.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                          !isAnalyzed
                            ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed'
                            : isSent
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 cursor-default'
                              : sendingId === candidate.id
                                ? 'bg-brand-light/30 dark:bg-gray-700/30 text-brand-text/60 dark:text-gray-400 cursor-wait'
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white cursor-pointer hover:scale-105'
                        }`}
                      >
                        {sendingId === candidate.id ? (
                          <FaSpinner className="animate-spin" size={12} />
                        ) : (
                          <FaEnvelope size={12} />
                        )}
                        {isSent ? t('hr.analytics.sent') || 'Đã gửi' : t('hr.analytics.send') || 'Gửi báo cáo'}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AnalyticsTable