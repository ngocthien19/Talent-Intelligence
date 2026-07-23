import { motion } from 'framer-motion'
import { FaSpinner } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CandidateRow from './CandidateRow'
import Pagination from '~/components/common/Pagination'
import { formatNumber } from '~/utils/format'

const CandidateTable = ({
  candidates,
  pagination,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onStatusUpdate,
  onDelete,
  onPageChange,
  onSortChange,
  currentSortBy,
  currentSortOrder,
  isLoading
}) => {
  const { t } = useLanguage()
  const allSelected = candidates.length > 0 && candidates.every(c => selectedIds.includes(c.id))

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom border border-brand-light/30 dark:border-gray-700/50 overflow-hidden hover:shadow-glow transition-all duration-300">
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
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  {t('hr.candidate.name') || 'Tên'}
                  <span className="text-[10px]">{getSortIcon('name')}</span>
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                {t('hr.candidate.position') || 'Vị trí'}
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-brand-secondary dark:hover:text-white transition-colors select-none"
                onClick={() => handleSort('overall_score')}
              >
                <div className="flex items-center gap-1">
                  {t('hr.candidate.score') || 'Điểm'}
                  <span className="text-[10px]">{getSortIcon('overall_score')}</span>
                </div>
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-brand-secondary dark:hover:text-white transition-colors select-none"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  {t('hr.candidate.status') || 'Trạng thái'}
                  <span className="text-[10px]">{getSortIcon('status')}</span>
                </div>
              </th>
              <th
                className="px-3 py-3 text-left text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-brand-secondary dark:hover:text-white transition-colors select-none"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  {t('hr.candidate.date') || 'Ngày ứng tuyển'}
                  <span className="text-[10px]">{getSortIcon('created_at')}</span>
                </div>
              </th>
              <th className="px-3 py-3 text-right text-xs font-semibold text-brand-text/60 dark:text-gray-400 uppercase tracking-wider">
                {t('hr.candidate.actions') || 'Thao tác'}
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
            ) : (
              candidates.map((candidate, index) => (
                <CandidateRow
                  key={candidate.id || index}
                  candidate={candidate}
                  isSelected={selectedIds.includes(candidate.id)}
                  onSelect={(checked) => onSelectOne(candidate.id, checked)}
                  onStatusUpdate={onStatusUpdate}
                  onDelete={onDelete}
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
  )
}

export default CandidateTable