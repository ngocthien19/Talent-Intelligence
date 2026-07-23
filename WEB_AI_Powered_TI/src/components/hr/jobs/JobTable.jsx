import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner, FaTrash, FaCheck, FaPause, FaTimes } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import JobRow from './JobRow'
import Pagination from '~/components/common/Pagination'
import ConfirmModal from '~/components/common/ConfirmModal'
import { formatNumber } from '~/utils/format'

const JobTable = ({
  jobs,
  pagination,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onDelete,
  onDeleteBulk,
  onActivateBulk,
  onDeactivateBulk,
  onPageChange,
  onSortChange,
  onEdit,
  currentSortBy,
  currentSortOrder,
  isLoading
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
  const [isBulkActionOpen, setIsBulkActionOpen] = useState(false)

  const allSelected = jobs.length > 0 && jobs.every(j => selectedIds.includes(j.id))
  const selectedCount = selectedIds.length

  // Mở modal xác nhận xóa 1 công việc
  const openDeleteConfirm = (id, title) => {
    setConfirmModalConfig({
      title: t('hr.job.deleteTitle') || 'Xóa công việc',
      message: t('hr.job.deleteMessage') || `Bạn có chắc chắn muốn xóa công việc "${title}"? Hành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: t('hr.job.delete') || 'Xóa',
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

  // Mở modal xác nhận xóa hàng loạt
  const openDeleteBulkConfirm = () => {
    setConfirmModalConfig({
      title: t('hr.job.deleteBulkTitle') || 'Xóa hàng loạt công việc',
      message: t('hr.job.deleteBulkMessage') || `Bạn có chắc chắn muốn xóa ${selectedCount} công việc đã chọn? Hành động này không thể hoàn tác.`,
      type: 'danger',
      confirmText: t('hr.job.delete') || 'Xóa',
      onConfirm: handleConfirmDeleteBulk
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDeleteBulk = async () => {
    setIsProcessing(true)
    await onDeleteBulk(selectedIds)
    setIsProcessing(false)
    setIsConfirmModalOpen(false)
    setIsBulkActionOpen(false)
  }

  // Mở modal xác nhận kích hoạt hàng loạt
  const openActivateBulkConfirm = () => {
    setConfirmModalConfig({
      title: t('hr.job.activateBulkTitle') || 'Kích hoạt hàng loạt công việc',
      message: t('hr.job.activateBulkMessage') || `Bạn có chắc chắn muốn kích hoạt ${selectedCount} công việc đã chọn?`,
      type: 'info',
      confirmText: t('hr.job.activate') || 'Kích hoạt',
      onConfirm: handleConfirmActivateBulk
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmActivateBulk = async () => {
    setIsProcessing(true)
    await onActivateBulk(selectedIds)
    setIsProcessing(false)
    setIsConfirmModalOpen(false)
    setIsBulkActionOpen(false)
  }

  // Mở modal xác nhận tạm dừng hàng loạt
  const openDeactivateBulkConfirm = () => {
    setConfirmModalConfig({
      title: t('hr.job.deactivateBulkTitle') || 'Tạm dừng hàng loạt công việc',
      message: t('hr.job.deactivateBulkMessage') || `Bạn có chắc chắn muốn tạm dừng ${selectedCount} công việc đã chọn?`,
      type: 'warning',
      confirmText: t('hr.job.deactivate') || 'Tạm dừng',
      onConfirm: handleConfirmDeactivateBulk
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmDeactivateBulk = async () => {
    setIsProcessing(true)
    await onDeactivateBulk(selectedIds)
    setIsProcessing(false)
    setIsConfirmModalOpen(false)
    setIsBulkActionOpen(false)
  }

  // Xóa chọn
  const handleClearSelection = () => {
    onSelectAll(false)
  }

  // Handle sort
  const handleSort = (field) => {
    if (currentSortBy === field) {
      onSortChange(field, currentSortOrder === 'DESC' ? 'ASC' : 'DESC')
    } else {
      onSortChange(field, 'DESC')
    }
  }

  const getSortIcon = (field) => {
    if (currentSortBy !== field) return null
    return currentSortOrder === 'DESC' ? '↓' : '↑'
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
                {/* Left side - Bulk actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mr-1">
                    {t('hr.job.bulkActions') || 'Thao tác hàng loạt:'}
                  </span>

                  {/* Activate button */}
                  <button
                    onClick={openActivateBulkConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaCheck size={12} />
                    {t('hr.job.activate') || 'Kích hoạt'}
                  </button>

                  {/* Deactivate button */}
                  <button
                    onClick={openDeactivateBulkConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaPause size={12} />
                    {t('hr.job.deactivate') || 'Tạm dừng'}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={openDeleteBulkConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaTrash size={12} />
                    {t('hr.job.delete') || 'Xóa'}
                  </button>
                </div>

                {/* Right side - Selection info */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-text/60 dark:text-gray-400">
                    {t('hr.job.selected') || 'Đã chọn'}{' '}
                    <span className="font-semibold text-brand-primary">{selectedCount}</span>{' '}
                    {t('hr.job.jobs') || 'công việc'}
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
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                  />
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-brand-secondary dark:hover:text-white transition-colors select-none"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    {t('hr.job.title') || 'Tiêu đề'}
                    <span className="text-[10px] text-brand-primary/60">{getSortIcon('title')}</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.job.experienceLevel') || 'Cấp bậc'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.job.employmentType') || 'Loại hình'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.job.location') || 'Địa điểm'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.job.status') || 'Trạng thái'}
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-brand-secondary dark:hover:text-white transition-colors select-none"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-1">
                    {t('hr.job.createdAt') || 'Ngày tạo'}
                    <span className="text-[10px] text-brand-primary/60">{getSortIcon('created_at')}</span>
                  </div>
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.job.actions') || 'Thao tác'}
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
                jobs.map((job, index) => (
                  <JobRow
                    key={job.id || index}
                    job={job}
                    isSelected={selectedIds.includes(job.id)}
                    onSelect={(checked) => onSelectOne(job.id, checked)}
                    onEdit={onEdit}
                    onDelete={(id) => openDeleteConfirm(id, job.title)}
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
                {t('hr.job.showing') || 'Hiển thị'}{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {jobs.length}
                </span>{' '}
                /{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {formatNumber(pagination.total)}
                </span>{' '}
                {t('hr.job.jobs') || 'công việc'}
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

      {/* Confirm Modal */}
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

export default JobTable