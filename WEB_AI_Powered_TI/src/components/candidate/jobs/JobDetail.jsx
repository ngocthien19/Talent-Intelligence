import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaBookmark,
  FaRegBookmark,
  FaTag,
  FaArrowLeft,
  FaBriefcase,
  FaArrowRight
} from 'react-icons/fa'
import { toggleFavorite } from '~/redux/slices/favorite.slice'
import { toast } from 'react-toastify'
import { useAuth } from '~/hooks/useAuth'
import { useLanguage } from '~/hooks/useLanguage'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { Link } from 'react-router-dom'
import { syncFavorites } from '~/redux/slices/auth.slice'


const JobDetail = ({ job, onBack, formatSalary, getExperienceLabel }) => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const { favoriteIds, isLoading } = useSelector((state) => state.favorite)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    if (job?.id && favoriteIds) {
      setIsFavorite(favoriteIds.includes(job.id))
    }
  }, [favoriteIds, job?.id])

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để lưu việc làm')
      return
    }

    if (isToggling) return

    setIsToggling(true)
    try {
      const result = await dispatch(toggleFavorite(job.id)).unwrap()
      // Cập nhật local state
      const newIsFavorite = result.action === 'added'
      setIsFavorite(newIsFavorite)

      // Đồng bộ với auth slice
      const updatedFavorites = result.action === 'added'
        ? [...favoriteIds, job.id]
        : favoriteIds.filter(id => id !== job.id)
      dispatch(syncFavorites(updatedFavorites))

      toast.success(result.action === 'added' ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích')
    } catch (error) {
      toast.error(error || 'Thao tác thất bại')
    } finally {
      setIsToggling(false)
    }
  }

  if (!job) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-8 text-center border-t-4 border-brand-primary dark:border-brand-primary transition-all duration-300">
        <p className="text-brand-text dark:text-gray-400">
          Chọn một công việc để xem chi tiết
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 border-t-4 border-brand-primary dark:border-brand-primary transition-all duration-300 sticky top-24">
      {/* Back button - mobile */}
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-2 text-brand-text dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors duration-200 mb-4 cursor-pointer"
      >
        <FaArrowLeft size={16} />
        <span>Quay lại</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {job.company_logo ? (
            <img
              src={job.company_logo.secure_url}
              alt={job.company_name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-2xl dark:bg-gradient-brand">
              {job.company_name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
              {job.title}
            </h2>
            <p className="text-brand-text dark:text-gray-400 flex items-center gap-1">
              <FaBuilding size={14} className="dark:text-gray-400" />
              {job.company_name}
            </p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleToggleFavorite}
                disabled={isToggling || isLoading}
                className="p-2 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label={isFavorite ? t('common.removeFromFavorites') : t('common.addToFavorites')}
              >
                {isFavorite ? (
                  <FaBookmark size={24} className="text-brand-primary dark:text-brand-primary" />
                ) : (
                  <FaRegBookmark size={24} className="text-brand-text/60 dark:text-gray-500" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {isFavorite
                  ? t('common.removeFromFavorites') || 'Xóa khỏi yêu thích'
                  : t('common.addToFavorites') || 'Thêm vào yêu thích'
                }
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Link xem chi tiết công việc */}
      <Link
        to={`/jobs/${job.id}`}
        className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-secondary dark:hover:text-brand-primary font-medium transition-colors duration-300 group mb-4"
      >
        <span className="group-hover:underline underline-offset-2">
          {t('jobs.viewJobDetail') || 'Xem chi tiết công việc'}
        </span>
        <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
      </Link>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaMapMarkerAlt size={14} className="dark:text-gray-400" />
            {job.location}
          </span>
        )}
        {job.experience_level && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaClock size={14} className="dark:text-gray-400" />
            {getExperienceLabel(job.experience_level)}
          </span>
        )}
        {job.salary_range && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaMoneyBillWave size={14} className="dark:text-gray-400" />
            {formatSalary(job.salary_range)}
          </span>
        )}
        {job.employment_type && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaBriefcase size={14} className="dark:text-gray-400" />
            {job.employment_type}
          </span>
        )}
        {job.category_name && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaTag size={14} className="dark:text-gray-400" />
            {job.category_name}
          </span>
        )}
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 p-4 bg-brand-bg dark:bg-gray-800/50 rounded-xl">
        <div className="text-center">
          <p className="text-xs text-brand-text/60 dark:text-gray-500">Ngày đăng</p>
          <p className="text-sm font-medium text-brand-secondary dark:text-white">
            {new Date(job.created_at).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-brand-text/60 dark:text-gray-500">Loại hình</p>
          <p className="text-sm font-medium text-brand-secondary dark:text-white">
            {job.employment_type || 'Full-time'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-brand-text/60 dark:text-gray-500">Kinh nghiệm</p>
          <p className="text-sm font-medium text-brand-secondary dark:text-white">
            {getExperienceLabel(job.experience_level)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-brand-text/60 dark:text-gray-500">Cấp bậc</p>
          <p className="text-sm font-medium text-brand-secondary dark:text-white">
            {job.experience_level || 'Không yêu cầu'}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-3">
          Mô tả công việc
        </h3>
        <p className="text-brand-text dark:text-gray-300 whitespace-pre-line">
          {job.description}
        </p>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-3">
            Yêu cầu
          </h3>
          <p className="text-brand-text dark:text-gray-300 whitespace-pre-line">
            {job.requirements}
          </p>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-3">
            Quyền lợi
          </h3>
          <p className="text-brand-text dark:text-gray-300 whitespace-pre-line">
            {job.benefits}
          </p>
        </div>
      )}

      {/* Required skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-3">
            Kỹ năng yêu cầu
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nice to have skills */}
      {job.nice_to_have_skills && job.nice_to_have_skills.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-3">
            Kỹ năng thêm
          </h3>
          <div className="flex flex-wrap gap-2">
            {job.nice_to_have_skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-sm bg-brand-light/40 dark:bg-gray-700/50 text-brand-text dark:text-gray-400 px-3 py-1 rounded-full border border-dashed border-brand-light dark:border-gray-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Apply button */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-brand-light dark:border-gray-700">
        <button className="flex-1 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow dark:hover:shadow-glow transition-all duration-300 cursor-pointer">
          {t('jobs.applyNow') || 'Ứng tuyển ngay'}
        </button>
        <button className="px-6 py-3 border border-brand-primary dark:border-brand-primary text-brand-primary dark:text-brand-primary hover:bg-brand-primary dark:hover:bg-brand-primary hover:!text-white dark:hover:text-white rounded-xl font-medium transition-all duration-300 cursor-pointer">
          {t('jobs.saveJob') || 'Lưu việc làm'}
        </button>
      </div>
    </div>
  )
}

export default JobDetail