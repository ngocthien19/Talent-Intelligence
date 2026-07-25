import { motion } from 'framer-motion'
import { FaSearch, FaBriefcase, FaUserTie, FaChartLine, FaLaptopCode, FaPencilRuler } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const SemanticSearchEmptyState = ({ hasSearched, onReset }) => {
  const { t } = useLanguage()

  const suggestionKeywords = [
    { icon: FaBriefcase, label: 'Marketing' },
    { icon: FaUserTie, label: 'Quản lý' },
    { icon: FaChartLine, label: 'Tài chính' },
    { icon: FaLaptopCode, label: 'Công nghệ' },
    { icon: FaPencilRuler, label: 'Thiết kế' }
  ]

  if (hasSearched) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-12 text-center border border-brand-light/30 dark:border-gray-700/50"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-brand-light/20 dark:bg-gray-700/30 flex items-center justify-center mb-4">
          <FaSearch size={32} className="text-brand-text/40 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">
          {t('hr.search.noResultsTitle') || 'Không tìm thấy kết quả'}
        </h3>
        <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1 max-w-md mx-auto">
          {t('hr.search.noResultsDesc') || 'Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để tìm kiếm chính xác hơn'}
        </p>
        <button
          onClick={onReset}
          className="mt-4 px-4 py-2 text-sm font-medium border border-brand-light/50 dark:border-gray-700 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
        >
          {t('hr.search.clear') || 'Xóa kết quả'}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-12 text-center border border-brand-light/30 dark:border-gray-700/50"
    >
      <div className="w-20 h-20 mx-auto rounded-full bg-brand-light/20 dark:bg-gray-700/30 flex items-center justify-center mb-4">
        <FaSearch size={32} className="text-brand-text/40 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">
        {t('hr.search.startSearch') || 'Bắt đầu tìm kiếm'}
      </h3>
      <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1 max-w-md mx-auto">
        {t('hr.search.startSearchDesc') || 'Nhập từ khóa mô tả kỹ năng, kinh nghiệm hoặc vị trí mong muốn, AI sẽ tìm kiếm ứng viên phù hợp nhất cho bạn'}
      </p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {suggestionKeywords.map((item, index) => {
          const Icon = item.icon
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-brand-light/20 dark:bg-gray-700/30 rounded-full text-brand-text/60 dark:text-gray-400"
            >
              <Icon size={12} />
              {item.label}
            </span>
          )
        })}
      </div>
    </motion.div>
  )
}

export default SemanticSearchEmptyState