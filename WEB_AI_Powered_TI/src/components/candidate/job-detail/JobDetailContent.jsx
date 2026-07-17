import {
  FaBuilding,
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
  FaTag,
  FaBriefcase,
  FaBookmark,
  FaRegBookmark
} from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { formatSalary } from '~/utils/format'
import { toast } from 'react-toastify'
import { useAuth } from '~/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { toggleFavorite } from '~/redux/slices/favorite.slice'
import { syncFavorites } from '~/redux/slices/auth.slice'
import { useState, useEffect } from 'react'

const JobDetailContent = ({
  job,
  getExperienceLabel
}) => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const dispatch = useDispatch()
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

  // Format text with line breaks
  const formatTextWithBullets = (text) => {
    if (!text) return null
    const lines = text.split('\n').filter(line => line.trim() !== '')
    return lines.map((line, index) => (
      <div key={index} className="flex items-start gap-3 mb-2">
        <span className="text-brand-primary font-medium mt-0.5">•</span>
        <span className="text-brand-text dark:text-gray-300 transition-colors duration-200">{line}</span>
      </div>
    ))
  }

  const formatDescription = (text) => {
    if (!text) return null
    return text.split('\n').map((line, index) => (
      <p key={index} className="text-brand-text dark:text-gray-300 mb-3 leading-relaxed transition-colors duration-200">
        {line}
      </p>
    ))
  }

  return (
    <div className="lg:col-span-2">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 border-l-4 border-l-brand-primary transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {job.company_logo ? (
              <img
                src={job.company_logo.secure_url}
                alt={job.company_name}
                className="w-16 h-16 rounded-xl object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-2xl transition-transform duration-300 hover:scale-105">
                {job.company_name?.charAt(0) || 'C'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-brand-secondary dark:text-white transition-colors duration-200">
                {job.title}
              </h1>
              <p className="text-brand-text dark:text-gray-400 flex items-center gap-1 transition-colors duration-200">
                <FaBuilding size={14} className="dark:text-gray-400" />
                {job.company_name}
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleFavorite}
            disabled={isToggling || isLoading}
            className="p-2 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110"
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            {isFavorite ? (
              <FaBookmark size={20} className="text-brand-primary transition-colors duration-200" />
            ) : (
              <FaRegBookmark size={20} className="text-brand-text/60 dark:text-gray-500 transition-colors duration-200" />
            )}
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {job.location && (
            <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default">
              <FaMapMarkerAlt size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {job.location}
            </span>
          )}
          {job.experience_level && (
            <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default">
              <FaClock size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {getExperienceLabel(job.experience_level)}
            </span>
          )}
          {job.salary_range && (
            <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default">
              <FaMoneyBillWave size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {formatSalary(job.salary_range)}
            </span>
          )}
          {job.employment_type && (
            <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default">
              <FaBriefcase size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {job.employment_type}
            </span>
          )}
          {job.category_name && (
            <span className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default">
              <FaTag size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {job.category_name}
            </span>
          )}
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50">
        <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
          {t('jobs.jobDescription') || 'Mô tả công việc'}
        </h2>
        <div className="text-brand-text dark:text-gray-300">
          {formatDescription(job.description)}
        </div>
      </div>

      {/* Requirements */}
      {job.requirements && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50">
          <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
            {t('jobs.requirements') || 'Yêu cầu'}
          </h2>
          <div className="text-brand-text dark:text-gray-300">
            {formatTextWithBullets(job.requirements)}
          </div>
        </div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50">
          <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
            {t('jobs.benefits') || 'Quyền lợi'}
          </h2>
          <div className="text-brand-text dark:text-gray-300">
            {formatTextWithBullets(job.benefits)}
          </div>
        </div>
      )}

      {/* Required Skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50">
          <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
            {t('jobs.requiredSkills') || 'Kỹ năng yêu cầu'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetailContent