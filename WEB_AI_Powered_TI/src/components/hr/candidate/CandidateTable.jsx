import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner, FaTrash, FaTimes, FaBalanceScale } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CandidateRow from './CandidateRow'
import Pagination from '~/components/common/Pagination'
import ConfirmModal from '~/components/common/ConfirmModal'
import { formatNumber } from '~/utils/format'

const CandidateTable = ({
  candidates,
  pagination,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onStatusUpdate,
  onDelete,
  onDeleteBulk,
  onPageChange,
  onSortChange,
  currentSortBy,
  currentSortOrder,
  isLoading,
  onCompare,
  onAnalyze,
  onViewAnalysis,
  analyzingId
}) => {
  const { t } = useLanguage()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: '',
    message: '',
    type: 'danger',
    confirmText: '',
    onConfirm: () => {}
  })
  const [isDeleting, setIsDeleting] = useState(false)

  const allSelected = candidates.length > 0 && candidates.every(c => selectedIds.includes(c.id))
  const selectedCount = selectedIds.length

  const openSingleDeleteConfirm = (id, candidateName) => {
    const displayName = candidateName || 'ứng viên'
    const messageTemplate = t('hr.candidate.deleteMessage') || 'Bạn có chắc chắn muốn xóa ứng viên {name}? Hành động này không thể hoàn tác.'

    const parts = messageTemplate.split(/\{name\}/)

    setConfirmModalConfig({
      title: t('hr.candidate.deleteTitle') || 'Xóa ứng viên',
      message: (
        <>
          {parts[0]}
          <span className="font-bold text-brand-primary">{displayName}</span>
          {parts[1] || ''}
        </>
      ),
      type: 'danger',
      confirmText: t('hr.candidate.delete') || 'Xóa',
      onConfirm: () => handleConfirmSingleDelete(id)
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSingleDelete = async (id) => {
    setIsDeleting(true)
    await onDelete(id)
    setIsDeleting(false)
    setIsConfirmModalOpen(false)
  }

  const openDeleteConfirm = () => {
    const messageTemplate = t('hr.candidate.deleteBulkMessage') || 'Bạn có chắc chắn muốn xóa {count} ứng viên đã chọn? Hành động này không thể hoàn tác.'

    const parts = messageTemplate.split(/\{count\}/)

    setConfirmModalConfig({
      title: t('hr.candidate.deleteBulkTitle') || 'Xóa hàng loạt ứng viên',
      message: (
        <>
          {parts[0]}
          <span className="font-bold text-red-600">{selectedCount}</span>
          {parts[1] || ''}
        </>
      ),
      type: 'danger',
      confirmText: t('hr.candidate.delete') || 'Xóa',
      onConfirm: handleConfirmDeleteBulk
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDeleteBulk = async () => {
    setIsDeleting(true)
    await onDeleteBulk(selectedIds)
    setIsDeleting(false)
    setIsConfirmModalOpen(false)
  }

  const handleClearSelection = () => {
    onSelectAll(false)
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 overflow-hidden hover:shadow-glow transition-all duration-300">
        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="border-b border-brand-light/30 dark:border-gray-700/50 bg-brand-light/10 dark:bg-gray-800/50 px-4 py-2.5 overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mr-1">
                    {t('hr.candidate.bulkActions') || 'Thao tác hàng loạt:'}
                  </span>

                  {selectedCount >= 2 && selectedCount <= 5 && (
                    <button
                      onClick={onCompare}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                    >
                      <FaBalanceScale size={12} />
                      {t('hr.comparison.compare') || 'So sánh'}
                    </button>
                  )}

                  <button
                    onClick={openDeleteConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaTrash size={12} />
                    {t('hr.candidate.delete') || 'Xóa'}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-text/60 dark:text-gray-400">
                    {t('hr.candidate.selected') || 'Đã chọn'}{' '}
                    <span className="font-semibold text-brand-primary">{selectedCount}</span>{' '}
                    {t('hr.candidate.candidates') || 'ứng viên'}
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="p-1 rounded-lg text-brand-text/40 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-brand-light/30 dark:border-gray-700/50">
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.candidate.name') || 'Tên'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.candidate.position') || 'Vị trí'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.candidate.cv') || 'CV'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.candidate.score') || 'Điểm'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.candidate.status') || 'Trạng thái'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.candidate.date') || 'Ngày ứng tuyển'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.candidate.actions') || 'Thao tác'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light/30 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-3 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-brand-text/60 dark:text-gray-400">
                      <FaSpinner className="animate-spin text-brand-primary" size={20} />
                      <span>{t('common.loading') || 'Đang tải...'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                candidates.map((candidate, index) => (
                  <CandidateRow
                    key={candidate.id || index}
                    candidate={candidate}
                    isSelected={selectedIds.includes(candidate.id)}
                    onSelect={(checked) => onSelectOne(candidate.id, checked)}
                    onStatusUpdate={onStatusUpdate}
                    onDelete={(id) => openSingleDeleteConfirm(id, candidate.name)}
                    onAnalyze={onAnalyze}
                    onViewAnalysis={onViewAnalysis}
                    isAnalyzing={analyzingId === candidate.id}
                    index={index}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-brand-light/30 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {t('hr.candidate.showing') || 'Hiển thị'}{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {candidates.length}
                </span>{' '}
                /{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {formatNumber(pagination.total)}
                </span>{' '}
                {t('hr.candidate.candidates') || 'ứng viên'}
              </p>

              <Pagination
                currentPage={pagination.page || 1}
                totalPages={pagination.totalPages || 1}
                onPageChange={onPageChange}
              />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmModalConfig.onConfirm}
        title={confirmModalConfig.title}
        message={confirmModalConfig.message}
        confirmText={confirmModalConfig.confirmText}
        type={confirmModalConfig.type}
        isLoading={isDeleting}
      />
    </>
  )
}

export default CandidateTable