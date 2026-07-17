import { useEffect, useRef, useState } from 'react'
import { FaTimes, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'danger', // 'danger' | 'warning' | 'info' | 'success'
  isLoading = false
}) => {
  const { t } = useLanguage()
  const modalRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isRendered, setIsRendered] = useState(false)

  // Đóng modal khi click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
      setIsRendered(true)
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
      setTimeout(() => setIsRendered(false), 300)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Đóng modal khi nhấn ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }

    return () => {
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  // Xử lý đóng modal với animation
  const handleClose = () => {
    if (isLoading) return // Không cho đóng khi đang loading

    setIsVisible(false)
    setTimeout(() => {
      setIsRendered(false)
      onClose()
    }, 300) // Đợi animation kết thúc
  }

  // Xử lý xác nhận
  const handleConfirm = async () => {
    if (!isLoading) {
      await onConfirm()
      // Modal sẽ tự động đóng sau khi onConfirm hoàn thành
      // vì isLoading sẽ được set về false và onClose sẽ được gọi từ component cha
    }
  }

  if (!isOpen && !isRendered) return null

  const getTypeStyles = () => {
    switch (type) {
    case 'danger':
      return {
        icon: 'text-red-500',
        iconBg: 'bg-red-50 dark:bg-red-950/20',
        iconBorder: 'border-red-200 dark:border-red-800',
        confirmBtn: 'bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40',
        border: 'border-red-200 dark:border-red-800',
        progressBar: 'bg-red-500'
      }
    case 'warning':
      return {
        icon: 'text-yellow-500',
        iconBg: 'bg-yellow-50 dark:bg-yellow-950/20',
        iconBorder: 'border-yellow-200 dark:border-yellow-800',
        confirmBtn: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 focus:ring-yellow-500 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40',
        border: 'border-yellow-200 dark:border-yellow-800',
        progressBar: 'bg-yellow-500'
      }
    case 'success':
      return {
        icon: 'text-green-500',
        iconBg: 'bg-green-50 dark:bg-green-950/20',
        iconBorder: 'border-green-200 dark:border-green-800',
        confirmBtn: 'bg-green-500 hover:bg-green-600 active:bg-green-700 focus:ring-green-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40',
        border: 'border-green-200 dark:border-green-800',
        progressBar: 'bg-green-500'
      }
    case 'info':
    default:
      return {
        icon: 'text-brand-primary',
        iconBg: 'bg-brand-light/40 dark:bg-gray-700/30',
        iconBorder: 'border-brand-light dark:border-gray-600',
        confirmBtn: 'bg-gradient-brand hover:shadow-glow focus:ring-brand-primary text-white shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40',
        border: 'border-brand-light dark:border-gray-700',
        progressBar: 'bg-brand-primary'
      }
    }
  }

  const getIcon = () => {
    switch (type) {
    case 'danger':
      return <FaExclamationTriangle size={22} />
    case 'warning':
      return <FaExclamationTriangle size={22} />
    case 'success':
      return <FaCheckCircle size={22} />
    case 'info':
    default:
      return <FaInfoCircle size={22} />
    }
  }

  const styles = getTypeStyles()

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out ${
          isVisible
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4'
        } border border-white/10 dark:border-gray-700/50 overflow-hidden`}
      >
        {/* Header với gradient line */}
        <div className={`h-1 w-full ${styles.progressBar} transition-all duration-500`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-3 rounded-2xl border ${styles.iconBg} ${styles.iconBorder} transition-all duration-300 group-hover:scale-110`}>
              <div className={styles.icon}>
                {getIcon()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-brand-secondary dark:text-white leading-tight">
                {title || t('common.confirm') || 'Xác nhận'}
              </h3>
              <p className="mt-2 text-sm text-brand-text/80 dark:text-gray-400 leading-relaxed">
                {message || t('common.confirmMessage') || 'Bạn có chắc chắn muốn thực hiện hành động này?'}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-shrink-0 p-2 rounded-xl text-brand-text/40 dark:text-gray-500 hover:text-brand-primary dark:hover:text-white hover:bg-brand-light/50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Close"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-brand-light/50 dark:border-gray-700/50" />

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 pt-4">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="group relative px-5 py-2.5 text-sm font-medium text-brand-text/70 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {cancelText || t('common.cancel') || 'Hủy'}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent to-white/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`group relative px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden ${styles.confirmBtn}`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.loading') || 'Đang xử lý...'}
                </>
              ) : (
                confirmText || t('common.confirm') || 'Xác nhận'
              )}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal