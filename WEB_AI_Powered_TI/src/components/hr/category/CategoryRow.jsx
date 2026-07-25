import { motion } from 'framer-motion'
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { useLanguage } from '~/hooks/useLanguage'
import { formatDate } from '~/utils/format'

const CategoryRow = ({
  category,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  index
}) => {
  const { t } = useLanguage()

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        backgroundColor: 'rgba(0,0,0,0.02)',
        transition: { duration: 0.15 }
      }}
      className="hover:bg-brand-light/5 dark:hover:bg-gray-800/30 transition-colors duration-150"
    >
      {/* Checkbox */}
      <td className="px-3 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all duration-200 cursor-pointer hover:scale-110"
        />
      </td>

      {/* Name */}
      <td className="px-3 py-3 text-left">
        <p className="font-medium text-brand-secondary dark:text-white">
          {category.name}
        </p>
        {category.slug && (
          <p className="text-xs text-brand-text/40 dark:text-gray-500">
            slug: {category.slug}
          </p>
        )}
      </td>

      {/* Description */}
      <td className="px-3 py-3 text-left">
        <p className="text-sm text-brand-text dark:text-gray-300 truncate max-w-[250px]">
          {category.description || '--'}
        </p>
      </td>

      {/* Status */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          category.is_active
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {category.is_active ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('hr.category.active') || 'Đang hoạt động'}
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {t('hr.category.inactive') || 'Tạm dừng'}
            </>
          )}
        </span>
      </td>

      {/* Created At */}
      <td className="px-3 py-3 text-center">
        <p className="text-xs text-brand-text/60 dark:text-gray-400">
          {category.created_at ? formatDate(new Date(category.created_at)) : '--'}
        </p>
      </td>

      {/* Actions */}
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          {/* Toggle Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onToggleStatus(category.id, !category.is_active)}
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
                    category.is_active
                      ? 'border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white dark:border-emerald-400 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white'
                      : 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white' // ← Đổi thành màu đỏ
                  }`}
                >
                  {category.is_active ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{category.is_active ? t('hr.category.deactivate') || 'Tạm dừng' : t('hr.category.activate') || 'Kích hoạt'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Edit */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onEdit(category)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaEdit size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.category.edit') || 'Chỉnh sửa'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onDelete(category.id)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaTrash size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.category.delete') || 'Xóa'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </motion.tr>
  )
}

export default CategoryRow