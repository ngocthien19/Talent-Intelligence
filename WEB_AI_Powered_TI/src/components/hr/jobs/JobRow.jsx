import { motion } from 'framer-motion'
import {
  FaEdit,
  FaTrash,
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave
} from 'react-icons/fa'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { useLanguage } from '~/hooks/useLanguage'
import JobStatusBadge from './JobStatusBadge'
import { formatDate, formatSalary } from '~/utils/format'

const JobRow = ({
  job,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
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
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
          className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all duration-200 cursor-pointer hover:scale-110"
        />
      </td>
      <td className="px-3 py-3">
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
      <td className="px-3 py-3">
        <p className="text-brand-text dark:text-gray-300">
          {job.experience_level || '--'}
        </p>
      </td>
      <td className="px-3 py-3">
        <p className="text-brand-text dark:text-gray-300">
          {job.employment_type || '--'}
        </p>
      </td>
      <td className="px-3 py-3">
        {job.location ? (
          <div className="flex items-center gap-1 text-brand-text/60 dark:text-gray-400">
            <FaMapMarkerAlt size={12} />
            <span className="text-sm">{job.location}</span>
          </div>
        ) : (
          <span className="text-sm text-brand-text/40 dark:text-gray-500">--</span>
        )}
      </td>
      <td className="px-3 py-3">
        <JobStatusBadge isActive={job.is_active} />
      </td>
      <td className="px-3 py-3">
        <p className="text-xs text-brand-text/60 dark:text-gray-400">
          {job.created_at ? formatDate(new Date(job.created_at)) : '--'}
        </p>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Edit - Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onEdit(job)}
                  className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white dark:border-brand-primary dark:text-brand-light dark:hover:bg-brand-primary dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                >
                  <FaEdit size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{t('hr.job.edit') || 'Chỉnh sửa'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Delete - Tooltip */}
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