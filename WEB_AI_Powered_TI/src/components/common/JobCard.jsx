import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaBookmark,
  FaRegBookmark,
  FaTag
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useAuth } from '~/hooks/useAuth'
import { useLanguage } from '~/hooks/useLanguage'
import { formatSalary, getDaysAgo } from '~/utils/format'
import { getExperienceLabel } from '~/utils/constant'
import { useDispatch } from 'react-redux'
import { toggleFavorite } from '~/redux/slices/favorite.slice'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'

const JobCard = ({
  job,
  isSelected = false,
  onClick = null,
  showCategory = false,
  variant = 'default'
}) => {
  const { t } = useLanguage()
  const dispatch = useDispatch() // THÊM
  const { isAuthenticated, favoriteIds, addFavorite, removeFavorite, isFavorite: checkFavorite } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (job?.id && checkFavorite) {
      setIsFavorite(checkFavorite(job.id))
    }
  }, [favoriteIds, job?.id, checkFavorite])

  const handleToggleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning(t('common.loginRequired') || 'Vui lòng đăng nhập để lưu việc làm')
      return
    }

    if (isToggling) return

    setIsToggling(true)
    try {
      const result = await dispatch(toggleFavorite(job.id)).unwrap()

      if (result.action === 'added') {
        addFavorite(job.id)
        setIsFavorite(true)
        toast.success('Đã thêm vào yêu thích')
      } else {
        removeFavorite(job.id)
        setIsFavorite(false)
        toast.success('Đã xóa khỏi yêu thích')
      }
    } catch (error) {
      toast.error(error || 'Thao tác thất bại')
    } finally {
      setIsToggling(false)
    }
  }

  const variantClasses = {
    default: {
      container: 'p-6',
      title: 'text-base',
      description: 'line-clamp-2'
    },
    compact: {
      container: 'p-4',
      title: 'text-sm',
      description: 'line-clamp-1'
    },
    detailed: {
      container: 'p-6',
      title: 'text-base',
      description: 'line-clamp-3'
    }
  }

  const styles = variantClasses[variant] || variantClasses.default
  const Wrapper = onClick ? 'div' : Link
  const wrapperProps = onClick ? { onClick: () => onClick(job.id) } : { to: `/jobs/${job.id}` }

  return (
    <Wrapper
      {...wrapperProps}
      className={`job-card group relative rounded-xl shadow-custom border-y border-r transition-all duration-300 ease-in-out ${
        onClick ? 'cursor-pointer' : ''
      } ${styles.container} ${
        isSelected
          ? 'bg-brand-light/20 dark:bg-gray-700/70 border-brand-primary/30 dark:border-brand-primary/40 border-l-[6px] border-l-brand-primary dark:border-l-brand-primary shadow-glow dark:shadow-glow scale-[1.02] transform' +
            ' after:hidden lg:after:block after:content-[""] after:absolute after:top-1/2 after:-translate-y-1/2 after:-right-[10px] after:z-10' +
            ' after:w-0 after:h-0 after:border-t-[10px] after:border-t-transparent after:border-b-[10px] after:border-b-transparent' +
            ' after:border-l-[10px] after:border-l-brand-primary dark:after:border-l-brand-primary' +
            ' after:transition-all after:duration-300'
          : 'bg-white dark:bg-gray-800 dark:shadow-gray-800/30 border-l-[6px] border-l-transparent hover:scale-[1.02] hover:shadow-glow dark:hover:shadow-gray-800/50 hover:border-brand-primary/30 dark:hover:border-brand-primary/20 hover:border-l-brand-primary/50 dark:hover:border-l-brand-primary/40'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {job.company_logo ? (
            <img
              src={job.company_logo.secure_url}
              alt={job.company_name}
              className="company-logo w-12 h-12 rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="company-logo w-12 h-12 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-lg transition-transform duration-300 group-hover:scale-105">
              {job.company_name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <h3 className={`job-title font-semibold transition-colors duration-300 line-clamp-1 ${styles.title} ${
              isSelected
                ? 'text-brand-primary dark:text-brand-primary'
                : 'text-black dark:text-white group-hover:text-brand-primary dark:group-hover:text-brand-primary'
            }`}>
              {job.title}
            </h3>
            <p className="text-sm text-brand-text dark:text-gray-400 flex items-center gap-1 mt-0.5">
              <FaBuilding size={12} />
              {job.company_name}
            </p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="p-1.5 rounded-lg text-brand-text/40 dark:text-gray-500 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-brand-light/50 dark:hover:bg-gray-700 transition-all duration-300 cursor-pointer hover:scale-110 flex-shrink-0 inline-flex items-center justify-center">
                <button
                  onClick={handleToggleFavorite}
                  disabled={isToggling}
                  className="bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  aria-label={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
                >
                  {isFavorite ? (
                    <FaBookmark size={18} className="text-brand-primary dark:text-brand-primary" />
                  ) : (
                    <FaRegBookmark size={18} className="dark:text-gray-400" />
                  )}
                </button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isFavorite
                  ? 'Xóa khỏi yêu thích'
                  : 'Thêm vào yêu thích'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-2 mt-3">
        <p className={`text-sm text-brand-text dark:text-gray-300 ${styles.description}`}>
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
        {showCategory && job.category_name && (
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
        <span className={`text-xs font-medium ${isSelected ? 'text-brand-primary dark:text-brand-primary' : 'text-brand-primary dark:text-brand-primary'}`}>
          {job.employment_type || 'Full-time'}
        </span>
      </div>
    </Wrapper>
  )
}

export default JobCard