import { motion } from 'framer-motion'
import { FaFolder, FaSearch, FaPlus } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const CategoryEmptyState = ({ onReset, keyword, onOpenCreateModal }) => {
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
          <FaFolder size={32} className="text-brand-text/40 dark:text-gray-500" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">
        {keyword
          ? t('hr.category.noCategoriesFound') || 'Không tìm thấy danh mục'
          : t('hr.category.noCategories') || 'Chưa có danh mục nào'
        }
      </h3>

      <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1 max-w-md mx-auto">
        {keyword
          ? `${t('hr.category.noCategoriesFoundWith') || 'Không tìm thấy danh mục nào với từ khóa'} "${keyword}"`
          : t('hr.category.emptyDesc') || 'Bắt đầu tạo danh mục mới để phân loại công việc'
        }
      </p>

      {keyword ? (
        <button
          onClick={onReset}
          className="mt-6 px-4 py-2 text-sm font-medium border border-brand-light/50 dark:border-gray-700 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer"
        >
          {t('hr.category.clearFilters') || 'Xóa bộ lọc'}
        </button>
      ) : (
        <button
          onClick={onOpenCreateModal}
          className="mt-6 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 flex items-center gap-2 mx-auto"
        >
          <FaPlus size={14} />
          {t('hr.category.add') || 'Thêm danh mục'}
        </button>
      )}
    </motion.div>
  )
}

export default CategoryEmptyState