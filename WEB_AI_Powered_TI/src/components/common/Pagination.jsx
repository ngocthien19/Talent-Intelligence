import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useLanguage()

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-sm font-medium border border-brand-primary text-brand-primary hover:!text-white hover:bg-brand-primary rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-primary cursor-pointer"
        aria-label={t('pagination.previous') || 'Trang trước'}
      >
        <FaChevronLeft size={14} className="inline mr-1" />
        {t('pagination.previous') || 'Trước'}
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1 mx-2">
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-300 cursor-pointer ${
              page === currentPage
                ? 'bg-gradient-brand text-white shadow-custom cursor-pointer'
                : page === '...'
                  ? 'text-brand-text/50 dark:text-gray-500 cursor-default'
                  : 'border border-brand-primary text-brand-primary hover:!text-white hover:bg-brand-primary cursor-pointer'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-sm font-medium border border-brand-primary text-brand-primary hover:!text-white hover:bg-brand-primary rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-brand-primary cursor-pointer"
        aria-label={t('pagination.next') || 'Trang sau'}
      >
        {t('pagination.next') || 'Sau'}
        <FaChevronRight size={14} className="inline ml-1" />
      </button>
    </div>
  )
}

export default Pagination