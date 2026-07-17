import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { useDispatch, useSelector } from 'react-redux'
import { getFavorites, clearFavorites } from '~/redux/slices/favorite.slice'
import { useAuth } from '~/hooks/useAuth'
import { Link } from 'react-router-dom'
import { FaBookmark, FaTrash, FaArrowLeft } from 'react-icons/fa'
import { toast } from 'react-toastify'
import JobCard from '~/components/common/JobCard'
import Pagination from '~/components/common/Pagination'
import ConfirmModal from '~/components/common/ConfirmModal'
import { syncFavorites } from '~/redux/slices/auth.slice'
import {
  formatSalary,
  getDaysAgo
} from '~/utils/format'
import {
  getExperienceLabel
} from '~/utils/constant'

const Favorites = () => {
  const { t } = useLanguage()
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const { favorites, isLoading, total, totalPages } = useSelector((state) => state.favorite)
  const [currentPage, setCurrentPage] = useState(1)
  const [isClearing, setIsClearing] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false) // State cho modal

  const fetchFavorites = useCallback(async (page = 1) => {
    if (!isAuthenticated) return

    try {
      await dispatch(getFavorites({ limit: 10, page })).unwrap()
    } catch (error) {
      toast.error(error || 'Không thể tải danh sách yêu thích')
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    fetchFavorites(currentPage)
  }, [currentPage, fetchFavorites])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Mở modal xác nhận
  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true)
  }

  // Đóng modal
  const handleCloseConfirmModal = () => {
    if (!isClearing) {
      setShowConfirmModal(false)
    }
  }

  // Xác nhận xóa
  const handleConfirmClear = async () => {
    setIsClearing(true)
    try {
      await dispatch(clearFavorites()).unwrap()
      dispatch(syncFavorites([]))
      toast.success(t('favorites.cleared') || 'Đã xóa tất cả công việc đã lưu')
      setShowConfirmModal(false)
      await fetchFavorites(1)
      setCurrentPage(1)
    } catch (error) {
      toast.error(error || 'Xóa thất bại')
    } finally {
      setIsClearing(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container animate-fade-in py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-12 text-center">
          <FaBookmark size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-secondary dark:text-white mb-2">
            {t('favorites.loginRequired') || 'Vui lòng đăng nhập'}
          </h2>
          <p className="text-brand-text dark:text-gray-400 mb-6">
            {t('favorites.loginToView') || 'Đăng nhập để xem danh sách công việc đã lưu'}
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer"
          >
            {t('auth.login') || 'Đăng nhập'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container animate-fade-in py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-secondary dark:text-white flex items-center gap-3 after:content-[''] after:hidden sm:after:inline-block after:w-16 md:after:w-24 after:h-[6px] after:bg-brand-primary/60 after:rounded-full">
            <FaBookmark size={24} className="text-brand-primary" />
            {t('favorites.title') || 'Công việc đã lưu'}
          </h1>
          <p className="text-brand-text dark:text-gray-400 text-sm mt-1">
            {t('favorites.count') || 'Đã lưu'} <span className="font-semibold text-brand-primary">{total}</span> {t('favorites.jobs') || 'công việc'}
          </p>
        </div>
        {favorites && favorites.length > 0 && (
          <button
            onClick={handleOpenConfirmModal}
            disabled={isClearing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02]"
          >
            <FaTrash size={14} />
            {isClearing ? (t('common.deleting') || 'Đang xóa...') : (t('favorites.clearAll') || 'Xóa tất cả')}
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 skeleton-pulse">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4">
            {favorites.map((fav) => (
              <JobCard
                key={fav.id || fav.job_id}
                job={{
                  id: fav.job_id,
                  title: fav.title,
                  description: fav.description,
                  company_name: fav.company_name,
                  company_logo: fav.company_logo,
                  location: fav.location,
                  experience_level: fav.experience_level,
                  salary_range: formatSalary(fav.salary_range),
                  employment_type: fav.employment_type,
                  category_name: fav.category_name,
                  created_at: fav.job_created_at || fav.created_at
                }}
                variant="default"
                showCategory={true}
                formatSalary={formatSalary}
                getExperienceLabel={getExperienceLabel}
                getDaysAgo={getDaysAgo}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-12 text-center">
          <FaBookmark size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
            {t('favorites.empty') || 'Chưa có công việc nào được lưu'}
          </h3>
          <p className="text-brand-text dark:text-gray-400 mb-6">
            {t('favorites.emptyDesc') || 'Hãy tìm kiếm và lưu những công việc bạn quan tâm'}
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          >
            <FaArrowLeft size={16} />
            {t('favorites.browseJobs') || 'Tìm việc ngay'}
          </Link>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleConfirmClear}
        title={t('favorites.confirmTitle') || 'Xóa tất cả công việc đã lưu'}
        message={t('favorites.confirmMessage') || 'Bạn có chắc chắn muốn xóa tất cả công việc đã lưu? Hành động này không thể hoàn tác.'}
        confirmText={t('favorites.confirmDelete') || 'Xóa tất cả'}
        cancelText={t('common.cancel') || 'Hủy'}
        type="danger"
        isLoading={isClearing}
      />
    </div>
  )
}

export default Favorites