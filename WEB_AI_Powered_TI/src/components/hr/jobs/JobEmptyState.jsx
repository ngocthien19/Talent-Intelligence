import { motion } from 'framer-motion'
import { FaBriefcase, FaSearch, FaPlus } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const JobEmptyState = ({ onReset, keyword, onOpenCreateModal }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-8 md:p-12 text-center border border-brand-light/30 dark:border-gray-700/50"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-brand-light/20 dark:bg-gray-700/30 flex items-center justify-center mb-4">
        {keyword ? (
          <FaSearch size={32} className="text-brand-text/40 dark:text-gray-500" />
        ) : (
          <FaBriefcase size={32} className="text-brand-text/40 dark:text-gray-500" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">
        {keyword
          ? t('hr.job.noJobsFound') || 'Không tìm thấy công việc'
          : t('hr.job.noJobs') || 'Chưa có công việc nào'
        }
      </h3>

      <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1 max-w-md mx-auto">
        {keyword
          ? `${t('hr.job.noJobsFoundWith') || 'Không tìm thấy công việc nào với từ khóa'} "${keyword}"`
          : t('hr.job.emptyDesc') || 'Bắt đầu tạo công việc mới để thu hút ứng viên'
        }
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {keyword && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium border border-brand-light/50 dark:border-gray-700 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
          >
            {t('hr.job.clearFilters') || 'Xóa bộ lọc'}
          </button>
        )}
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <FaPlus size={14} />
          {t('hr.job.add') || 'Thêm công việc'}
        </button>
      </div>
    </motion.div>
  )
}

export default JobEmptyState