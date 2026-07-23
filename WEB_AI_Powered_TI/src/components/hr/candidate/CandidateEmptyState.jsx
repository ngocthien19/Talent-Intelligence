import { motion } from 'framer-motion'
import { FaUsers, FaSearch, FaPlus } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { Link } from 'react-router-dom'

const CandidateEmptyState = ({ onReset, keyword }) => {
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
          <FaUsers size={32} className="text-brand-text/40 dark:text-gray-500" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">
        {keyword
          ? t('hr.candidate.noCandidatesFound') || 'Không tìm thấy ứng viên'
          : t('hr.candidate.noCandidates') || 'Chưa có ứng viên nào'
        }
      </h3>

      <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1 max-w-md mx-auto">
        {keyword
          ? `${t('hr.candidate.noCandidatesFoundWith') || 'Không tìm thấy ứng viên nào với từ khóa'} "${keyword}"`
          : t('hr.candidate.emptyDesc') || 'Bắt đầu tuyển dụng bằng cách thêm ứng viên mới hoặc đợi ứng viên ứng tuyển'
        }
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {keyword && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium border border-brand-light/50 dark:border-gray-700 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
          >
            {t('hr.candidate.clearFilters') || 'Xóa bộ lọc'}
          </button>
        )}
        <Link
          to="/hr/candidates/new"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
        >
          <FaPlus size={14} />
          {t('hr.candidate.add') || 'Thêm ứng viên'}
        </Link>
      </div>
    </motion.div>
  )
}

export default CandidateEmptyState