import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaBookmark,
  FaRegBookmark,
  FaTag,
  FaUsers,
  FaCalendarAlt,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaAward,
  FaGraduationCap,
  FaArrowLeft
} from 'react-icons/fa'
import { toggleFavorite } from '~/redux/slices/favorite.slice'
import { toast } from 'react-toastify'
import { useAuth } from '~/hooks/useAuth'

const JobDetail = ({ job, onBack, formatSalary, getExperienceLabel }) => {
  const dispatch = useDispatch()
  const { isAuthenticated } = useAuth()
  const { favoriteIds, isLoading } = useSelector((state) => state.favorite)
  const [isFavorite, setIsFavorite] = useState(favoriteIds.includes(job?.id))
  const [isToggling, setIsToggling] = useState(false)

  const handleToggleFavorite = async () => {
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

  if (!job) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-8 text-center">
        <p className="text-brand-text dark:text-gray-400">
          Chọn một công việc để xem chi tiết
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6">
      {/* Back button - mobile */}
      <button
        onClick={onBack}
        className="md:hidden flex items-center gap-2 text-brand-text dark:text-gray-400 hover:text-brand-primary transition-colors duration-200 mb-4"
      >
        <FaArrowLeft size={16} />
        <span>Quay lại</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {job.company_logo ? (
            <img
              src={job.company_logo}
              alt={job.company_name}
              className="w-16 h-16 rounded-xl object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-2xl">
              {job.company_name?.charAt(0) || 'C'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
              {job.title}
            </h2>
            <p className="text-brand-text dark:text-gray-400 flex items-center gap-1">
              <FaBuilding size={14} />
              {job.company_name}
            </p>
          </div>
        </div>
        <button
          onClick={handleToggleFavorite}
          disabled={isToggling || isLoading}
          className="p-2 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFavorite ? (
            <FaBookmark size={24} className="text-brand-primary" />
          ) : (
            <FaRegBookmark size={24} className="text-brand-text/60" />
          )}
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaMapMarkerAlt size={14} />
            {job.location}
          </span>
        )}
        {job.experience_level && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaClock size={14} />
            {getExperienceLabel(job.experience_level)}
          </span>
        )}
        {job.salary_range && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaMoneyBillWave size={14} />
            {formatSalary(job.salary_range)}
          </span>
        )}
        {job.employment_type && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaBriefcase size={14} />
            {job.employment_type}
          </span>
        )}
        {job.category_name && (
          <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full">
            <FaTag size={14} />
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
                className="px-3 py-1.5 bg-brand-light dark:bg-gray-700 text-brand-text dark:text-gray-300 rounded-lg text-sm"
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
                className="px-3 py-1.5 bg-brand-light/50 dark:bg-gray-700/50 text-brand-text dark:text-gray-300 rounded-lg text-sm border border-dashed border-brand-light dark:border-gray-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Apply button */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-brand-light dark:border-gray-700">
        <button className="flex-1 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300">
          Ứng tuyển ngay
        </button>
        <button className="px-6 py-3 border border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-xl font-medium transition-all duration-300">
          Lưu việc làm
        </button>
      </div>
    </div>
  )
}

export default JobDetail