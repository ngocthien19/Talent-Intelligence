import { motion, AnimatePresence } from 'framer-motion'
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

  const formatTextWithBullets = (text) => {
    if (!text) return null
    const lines = text.split('\n').filter(line => line.trim() !== '')
    return lines.map((line, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="flex items-start gap-3 mb-2"
      >
        <span className="text-brand-primary font-medium mt-0.5">•</span>
        <span className="text-brand-text dark:text-gray-300 transition-colors duration-200">{line}</span>
      </motion.div>
    ))
  }

  const formatDescription = (text) => {
    if (!text) return null
    return text.split('\n').map((line, index) => (
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        className="text-brand-text dark:text-gray-300 mb-3 leading-relaxed transition-colors duration-200"
      >
        {line}
      </motion.p>
    ))
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  const skillVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="lg:col-span-2"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 border-l-4 border-l-brand-primary transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleFavorite}
            disabled={isToggling || isLoading}
            className="p-2 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
          >
            <AnimatePresence mode="wait">
              {isFavorite ? (
                <motion.div
                  key="favorite"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaBookmark size={20} className="text-brand-primary transition-colors duration-200" />
                </motion.div>
              ) : (
                <motion.div
                  key="not-favorite"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaRegBookmark size={20} className="text-brand-text/60 dark:text-gray-500 transition-colors duration-200" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Tags */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center gap-2 mt-4"
        >
          {job.location && (
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default"
            >
              <FaMapMarkerAlt size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {job.location}
            </motion.span>
          )}
          {job.experience_level && (
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default"
            >
              <FaClock size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {getExperienceLabel(job.experience_level)}
            </motion.span>
          )}
          {job.salary_range && (
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default"
            >
              <FaMoneyBillWave size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {formatSalary(job.salary_range)}
            </motion.span>
          )}
          {job.employment_type && (
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default"
            >
              <FaBriefcase size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {job.employment_type}
            </motion.span>
          )}
          {job.category_name && (
            <motion.span
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default"
            >
              <FaTag size={14} className="dark:text-gray-400 transition-colors duration-200" />
              {job.category_name}
            </motion.span>
          )}
        </motion.div>
      </motion.div>

      {/* Job Description */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50"
      >
        <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
          {t('jobs.jobDescription') || 'Mô tả công việc'}
        </h2>
        <div className="text-brand-text dark:text-gray-300">
          {formatDescription(job.description)}
        </div>
      </motion.div>

      {/* Requirements */}
      {job.requirements && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50"
        >
          <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
            {t('jobs.requirements') || 'Yêu cầu'}
          </h2>
          <div className="text-brand-text dark:text-gray-300">
            {formatTextWithBullets(job.requirements)}
          </div>
        </motion.div>
      )}

      {/* Benefits */}
      {job.benefits && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50"
        >
          <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
            {t('jobs.benefits') || 'Quyền lợi'}
          </h2>
          <div className="text-brand-text dark:text-gray-300">
            {formatTextWithBullets(job.benefits)}
          </div>
        </motion.div>
      )}

      {/* Required Skills */}
      {job.required_skills && job.required_skills.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 mt-6 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50"
        >
          <h2 className="text-lg font-semibold text-brand-secondary dark:text-white mb-4 transition-colors duration-200">
            {t('jobs.requiredSkills') || 'Kỹ năng yêu cầu'}
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.required_skills.map((skill, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={skillVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: 1.05, y: -2 }}
                className="inline-flex items-center gap-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 px-3 py-1 rounded-full transition-all duration-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white cursor-default"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default JobDetailContent