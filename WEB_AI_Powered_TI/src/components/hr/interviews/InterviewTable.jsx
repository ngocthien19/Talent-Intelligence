import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner, FaTimes } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import InterviewRow from './InterviewRow'
import Pagination from '~/components/common/Pagination'
import ConfirmModal from '~/components/common/ConfirmModal'
import { formatNumber } from '~/utils/format'

const InterviewTable = ({
  interviews,
  pagination,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onView,
  onEdit,
  onDelete,
  onPageChange,
  isLoading,
  onBulkDelete
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
  const [isProcessing, setIsProcessing] = useState(false)

  const allSelected = interviews.length > 0 && interviews.every(i => selectedIds.includes(i.id))
  const selectedCount = selectedIds.length

  const openDeleteConfirm = (id) => {
    setConfirmModalConfig({
      title: t('hr.interview.deleteTitle') || 'Xóa lịch phỏng vấn',
      message: t('hr.interview.deleteMessage') || 'Bạn có chắc chắn muốn xóa lịch phỏng vấn này? Hành động này không thể hoàn tác.',
      type: 'danger',
      confirmText: t('hr.interview.delete') || 'Xóa',
      onConfirm: () => handleConfirmDelete(id)
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDelete = async (id) => {
    setIsProcessing(true)
    await onDelete(id)
    setIsProcessing(false)
    setIsConfirmModalOpen(false)
  }

  const openBulkDeleteConfirm = () => {
    setConfirmModalConfig({
      title: t('hr.interview.deleteBulkTitle') || 'Xóa hàng loạt lịch phỏng vấn',
      message: t('hr.interview.deleteBulkMessage') || `Bạn có chắc chắn muốn xóa ${selectedCount} lịch phỏng vấn đã chọn? Hành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: t('hr.interview.delete') || 'Xóa',
      onConfirm: handleConfirmBulkDelete
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmBulkDelete = async () => {
    setIsProcessing(true)
    await onBulkDelete(selectedIds)
    setIsProcessing(false)
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
                  <span className="text-xs font-medium text-brand-text/60 dark:text-gray-400">
                    {t('hr.interview.selected') || 'Đã chọn'}{' '}
                    <span className="font-semibold text-brand-primary">{selectedCount}</span>{' '}
                    {t('hr.interview.schedules') || 'lịch'}
                  </span>
                  <button
                    onClick={openBulkDeleteConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <span>{t('hr.interview.delete') || 'Xóa'}</span>
                  </button>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="p-1 rounded-lg text-brand-text/40 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
                >
                  <FaTimes size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-brand-light/30 dark:border-gray-700/50">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.interview.candidate') || 'Ứng viên'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.interview.position') || 'Vị trí'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.interview.dateTime') || 'Thời gian'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.interview.location') || 'Địa điểm'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.interview.statusLabel') || 'Trạng thái'}
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.interview.actions') || 'Thao tác'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light/30 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-3 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-brand-text/60 dark:text-gray-400">
                      <FaSpinner className="animate-spin text-brand-primary" size={20} />
                      <span>{t('common.loading') || 'Đang tải...'}</span>
                    </div>
                  </td>
                </tr>
              ) : interviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-3 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-brand-text/60 dark:text-gray-400">
                      <FaSpinner size={30} className="text-brand-primary/30" />
                      <p className="text-sm">{t('hr.interview.noSchedules') || 'Chưa có lịch phỏng vấn nào'}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                interviews.map((interview, index) => (
                  <InterviewRow
                    key={interview.id || index}
                    interview={interview}
                    isSelected={selectedIds.includes(interview.id)}
                    onSelect={(checked) => onSelectOne(interview.id, checked)}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={() => openDeleteConfirm(interview.id)}
                    index={index}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-brand-light/30 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-brand-text/60 dark:text-gray-400">
                {t('hr.interview.showing') || 'Hiển thị'}{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {interviews.length}
                </span>{' '}
                /{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {formatNumber(pagination.total)}
                </span>{' '}
                {t('hr.interview.schedules') || 'lịch'}
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
        isLoading={isProcessing}
      />
    </>
  )
}

export default InterviewTable