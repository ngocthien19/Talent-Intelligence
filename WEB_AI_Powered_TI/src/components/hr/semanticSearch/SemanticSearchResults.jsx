import { motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import SemanticSearchResultCard from './SemanticSearchResultCard'

const SemanticSearchResults = ({ results, total, query, onClear, isLoading }) => {
  const { t } = useLanguage()

  if (isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Result count */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-brand-text/60 dark:text-gray-400">
            {t('hr.search.found') || 'Tìm thấy'}{' '}
            <span className="font-bold text-brand-primary">{total}</span>{' '}
            {t('hr.search.results') || 'kết quả'}
            {query && (
              <span className="text-brand-text/40 dark:text-gray-500">
                {' '}{t('hr.search.for') || 'cho'} "{query}"
              </span>
            )}
          </p>
          <button
            onClick={onClear}
            className="text-xs text-brand-text/40 dark:text-gray-500 hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1"
          >
            <FaTimes size={12} />
            {t('hr.search.clear') || 'Xóa kết quả'}
          </button>
        </div>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <SemanticSearchResultCard
            key={result.application_id || index}
            result={result}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default SemanticSearchResults