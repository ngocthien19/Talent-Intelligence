import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaBookmark,
  FaRegBookmark,
  FaTag
} from 'react-icons/fa'
import { toggleFavorite, updateFavoriteStatus } from '~/redux/slices/favorite.slice'
import { toast } from 'react-toastify'
import { useAuth } from '~/hooks/useAuth'

const JobCard = ({ job, isSelected, onClick, formatSalary, getExperienceLabel, getDaysAgo }) => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const { favoriteIds, isLoading } = useSelector((state) => state.favorite)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    setIsFavorite(favoriteIds.includes(job.id))
  }, [favoriteIds, job.id])

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để lưu việc làm')
      return
    }

    if (isToggling) return

    setIsToggling(true)
    try {
      const result = await dispatch(toggleFavorite(job.id)).unwrap()
      setIsFavorite(result.action === 'added')
      toast.success(result.action === 'added' ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
    } catch (error) {
      toast.error(error || 'Thao tác thất bại')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className={`job-card group bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-5 hover:shadow-glow dark:hover:shadow-gray-800/50 transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-brand-primary shadow-glow' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {job.company_logo ? (
            <img
              src={job.company_logo}
              alt={job.company_name}
              className="company-logo w-12 h-12 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="company-logo w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-lg transition-transform duration-300 group-hover:scale-105">
              {job.company_name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <h3 className="job-title font-semibold text-black dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-primary transition-colors duration-300 line-clamp-1">
              {job.title}
            </h3>
            <p className="text-sm text-brand-text dark:text-gray-400 flex items-center gap-1">
              <FaBuilding size={12} />
              {job.company_name}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleFavorite}
          disabled={isToggling || isLoading}
          className="bookmark-btn text-brand-text/40 hover:text-brand-primary transition-all duration-300 cursor-pointer hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
        >
          {isFavorite ? (
            <FaBookmark size={18} className="text-brand-primary" />
          ) : (
            <FaRegBookmark size={18} />
          )}
        </button>
      </div>

      <div className="space-y-2 mt-3">
        <p className="text-sm text-brand-text dark:text-gray-300 line-clamp-2">
          {job.description}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-xs bg-brand-light dark:bg-gray-700 text-brand-text dark:text-gray-300 px-2 py-1 rounded-full">
            <FaMapMarkerAlt size={12} />
            {job.location}
          </span>
        )}
        {job.experience_level && (
          <span className="inline-flex items-center gap-1 text-xs bg-brand-light dark:bg-gray-700 text-brand-text dark:text-gray-300 px-2 py-1 rounded-full">
            <FaClock size={12} />
            {getExperienceLabel(job.experience_level)}
          </span>
        )}
        {job.salary_range && (
          <span className="inline-flex items-center gap-1 text-xs bg-brand-light dark:bg-gray-700 text-brand-text dark:text-gray-300 px-2 py-1 rounded-full">
            <FaMoneyBillWave size={12} />
            {formatSalary(job.salary_range)}
          </span>
        )}
        {job.category_name && (
          <span className="inline-flex items-center gap-1 text-xs bg-brand-light/50 dark:bg-gray-700/50 text-brand-text dark:text-gray-300 px-2 py-1 rounded-full">
            <FaTag size={12} />
            {job.category_name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-light dark:border-gray-700">
        <span className="text-xs text-brand-text/60 dark:text-gray-500">
          {getDaysAgo(job.created_at)}
        </span>
        <span className="text-xs font-medium text-brand-primary">
          {job.employment_type || 'Full-time'}
        </span>
      </div>
    </div>
  )
}

export default JobCard