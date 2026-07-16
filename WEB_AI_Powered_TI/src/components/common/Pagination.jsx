import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
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
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-brand-light dark:border-gray-700 hover:bg-brand-light dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Previous page"
      >
        <FaChevronLeft size={14} className="text-brand-text dark:text-gray-400" />
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors duration-200 ${
            page === currentPage
              ? 'bg-gradient-brand text-white shadow-custom'
              : page === '...'
                ? 'text-brand-text/50 dark:text-gray-500 cursor-default'
                : 'text-brand-text dark:text-gray-400 hover:bg-brand-light dark:hover:bg-gray-700'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-brand-light dark:border-gray-700 hover:bg-brand-light dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        aria-label="Next page"
      >
        <FaChevronRight size={14} className="text-brand-text dark:text-gray-400" />
      </button>
    </div>
  )
}

export default Pagination