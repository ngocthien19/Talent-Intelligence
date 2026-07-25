import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaSpinner, FaTrash, FaTimes, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CategoryRow from './CategoryRow'
import Pagination from '~/components/common/Pagination'
import ConfirmModal from '~/components/common/ConfirmModal'
import { formatNumber } from '~/utils/format'

const CategoryTable = ({
  categories,
  pagination,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onDelete,
  onDeleteBulk,
  onToggleStatus,
  onToggleStatusBulk,
  onEdit,
  onPageChange,
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

  const allSelected = categories.length > 0 && categories.every(c => selectedIds.includes(c.id))
  const selectedCount = selectedIds.length

  // Xóa 1 category
  const openDeleteConfirm = (id, categoryName) => {
    const displayName = categoryName || 'danh mục'
    const messageTemplate = t('hr.category.deleteMessage') || 'Bạn có chắc chắn muốn xóa danh mục "{name}"? Hành động này không thể hoàn tác.'

    const parts = messageTemplate.split(/\{name\}/)

    setConfirmModalConfig({
      title: t('hr.category.deleteTitle') || 'Xóa danh mục',
      message: (
        <>
          {parts[0]}
          <span className="font-bold text-brand-primary">"{displayName}"</span>
          {parts[1] || ''}
        </>
      ),
      type: 'danger',
      confirmText: t('hr.category.delete') || 'Xóa',
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

  // Xóa hàng loạt
  const openBulkDeleteConfirm = () => {
    const messageTemplate = t('hr.category.deleteBulkMessage') || 'Bạn có chắc chắn muốn xóa {count} danh mục đã chọn? Hành động này không thể hoàn tác.'

    const parts = messageTemplate.split(/\{count\}/)

    setConfirmModalConfig({
      title: t('hr.category.deleteBulkTitle') || 'Xóa hàng loạt danh mục',
      message: (
        <>
          {parts[0]}
          <span className="font-bold text-red-600">{selectedCount}</span>
          {parts[1] || ''}
        </>
      ),
      type: 'danger',
      confirmText: t('hr.category.delete') || 'Xóa',
      onConfirm: handleConfirmBulkDelete
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmBulkDelete = async () => {
    setIsProcessing(true)
    await onDeleteBulk(selectedIds)
    setIsProcessing(false)
    setIsConfirmModalOpen(false)
  }

  // Bulk Activate
  const openBulkActivateConfirm = () => {
    const messageTemplate = t('hr.category.activateBulkMessage') || 'Bạn có chắc chắn muốn kích hoạt {count} danh mục đã chọn?'

    const parts = messageTemplate.split(/\{count\}/)

    setConfirmModalConfig({
      title: t('hr.category.activateBulkTitle') || 'Kích hoạt hàng loạt danh mục',
      message: (
        <>
          {parts[0]}
          <span className="font-bold text-emerald-600">{selectedCount}</span>
          {parts[1] || ''}
        </>
      ),
      type: 'info',
      confirmText: t('hr.category.activate') || 'Kích hoạt',
      onConfirm: handleConfirmBulkActivate
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmBulkActivate = async () => {
    setIsProcessing(true)
    await onToggleStatusBulk(selectedIds, true)
    setIsProcessing(false)
    setIsConfirmModalOpen(false)
  }

  // Bulk Deactivate
  const openBulkDeactivateConfirm = () => {
    const messageTemplate = t('hr.category.deactivateBulkMessage') || 'Bạn có chắc chắn muốn tạm dừng {count} danh mục đã chọn?'

    const parts = messageTemplate.split(/\{count\}/)

    setConfirmModalConfig({
      title: t('hr.category.deactivateBulkTitle') || 'Tạm dừng hàng loạt danh mục',
      message: (
        <>
          {parts[0]}
          <span className="font-bold text-yellow-600">{selectedCount}</span>
          {parts[1] || ''}
        </>
      ),
      type: 'warning',
      confirmText: t('hr.category.deactivate') || 'Tạm dừng',
      onConfirm: handleConfirmBulkDeactivate
    })
    setIsConfirmModalOpen(true)
  }

  const handleConfirmBulkDeactivate = async () => {
    setIsProcessing(true)
    await onToggleStatusBulk(selectedIds, false)
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
                  <span className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mr-1">
                    {t('hr.category.bulkActions') || 'Thao tác hàng loạt:'}
                  </span>

                  {/* Bulk Activate */}
                  <button
                    onClick={openBulkActivateConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaToggleOn size={12} />
                    {t('hr.category.activate') || 'Kích hoạt'}
                  </button>

                  {/* Bulk Deactivate */}
                  <button
                    onClick={openBulkDeactivateConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaToggleOff size={12} />
                    {t('hr.category.deactivate') || 'Tạm dừng'}
                  </button>

                  {/* Bulk Delete */}
                  <button
                    onClick={openBulkDeleteConfirm}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaTrash size={12} />
                    {t('hr.category.delete') || 'Xóa'}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-brand-text/60 dark:text-gray-400">
                    {t('hr.category.selected') || 'Đã chọn'}{' '}
                    <span className="font-semibold text-brand-primary">{selectedCount}</span>{' '}
                    {t('hr.category.categories') || 'danh mục'}
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
                  {t('hr.category.name') || 'Tên danh mục'}
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.category.description') || 'Mô tả'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.category.status') || 'Trạng thái'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.category.createdAt') || 'Ngày tạo'}
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                  {t('hr.category.actions') || 'Thao tác'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light/30 dark:divide-gray-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-3 py-12 text-center">
                    <div className="flex items-center justify-center gap-3 text-brand-text/60 dark:text-gray-400">
                      <FaSpinner className="animate-spin text-brand-primary" size={20} />
                      <span>{t('common.loading') || 'Đang tải...'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <CategoryRow
                    key={category.id || index}
                    category={category}
                    isSelected={selectedIds.includes(category.id)}
                    onSelect={(checked) => onSelectOne(category.id, checked)}
                    onEdit={onEdit}
                    onDelete={(id) => openDeleteConfirm(id, category.name)}
                    onToggleStatus={onToggleStatus}
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
                {t('hr.category.showing') || 'Hiển thị'}{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {categories.length}
                </span>{' '}
                /{' '}
                <span className="font-medium text-brand-secondary dark:text-white">
                  {formatNumber(pagination.total)}
                </span>{' '}
                {t('hr.category.categories') || 'danh mục'}
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

export default CategoryTable