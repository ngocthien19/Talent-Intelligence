import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaMapMarkerAlt,
  FaHeart
} from 'react-icons/fa'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { useLanguage } from '~/hooks/useLanguage'
import JobStatusBadge from './JobStatusBadge'
import { formatDate } from '~/utils/format'

const JobRow = ({
  job,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onViewFavorites, // Thêm prop mới
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
      {/* Checkbox - Căn giữa */}
      <td className="px-3 py-3 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all duration-200 cursor-pointer hover:scale-110"
        />
      </td>

      {/* Title - Căn trái */}
      <td className="px-3 py-3 text-left">
        <div>
          <p className="font-medium text-brand-secondary dark:text-white truncate max-w-[200px] transition-colors duration-200 hover:text-brand-primary">
            {job.title}
          </p>
          {job.category_name && (
            <p className="text-xs text-brand-text/40 dark:text-gray-500">
              {job.category_name}
            </p>
          )}
        </div>
      </td>

      {/* Experience Level - Căn giữa */}
      <td className="px-3 py-3 text-center">
        <p className="text-brand-text dark:text-gray-300">
          {job.experience_level || '--'}
        </p>
      </td>

      {/* Employment Type - Căn giữa */}
      <td className="px-3 py-3 text-center">
        <p className="text-brand-text dark:text-gray-300">
          {job.employment_type || '--'}
        </p>
      </td>

      {/* Location - Căn giữa */}
      <td className="px-3 py-3 text-center">
        {job.location ? (
          <div className="flex items-center justify-center gap-1 text-brand-text/60 dark:text-gray-400">
            <FaMapMarkerAlt size={12} />
            <span className="text-sm">{job.location}</span>
          </div>
        ) : (
          <span className="text-sm text-brand-text/40 dark:text-gray-500">--</span>
        )}
      </td>

      {/* Status - Căn giữa */}
      <td className="px-3 py-3 text-center">
        <JobStatusBadge isActive={job.is_active} />
      </td>

      {/* Created At - Căn giữa */}
      <td className="px-3 py-3 text-center">
        <p className="text-xs text-brand-text/60 dark:text-gray-400">
          {job.created_at ? formatDate(new Date(job.created_at)) : '--'}
        </p>
      </td>

      {/* Actions - Căn giữa */}
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          {/* View Favorites - Nút mới */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onViewFavorites(job)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white dark:border-pink-400 dark:text-pink-400 dark:hover:bg-pink-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaHeart size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.job.viewFavorites') || 'Xem ứng viên yêu thích'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* View Detail */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  to={`/hr/jobs/${job.id}`}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaEye size={15} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.job.viewDetail') || 'Xem chi tiết'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Edit */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onEdit(job)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaEdit size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.job.edit') || 'Chỉnh sửa'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onDelete(job.id)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaTrash size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.job.delete') || 'Xóa'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </td>
    </motion.tr>
  )
}

export default JobRow