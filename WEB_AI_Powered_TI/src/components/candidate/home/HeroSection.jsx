import { motion } from 'framer-motion'
import { FaLightbulb, FaBriefcase, FaUpload } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { Link } from 'react-router-dom'
import SearchForm from './SearchForm'

const HeroSection = ({ jobCount }) => {
  const { t } = useLanguage()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative z-20 py-16 md:py-24 mb-12"
    >
      {/* Background wrapper */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[3rem]">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(\'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop\')' }}
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)] dark:bg-[rgba(0,0,0,0.4)] backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.div
          variants={itemVariants}
          className="hero-badge inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md text-brand-primary px-5 py-2.5 rounded-full text-sm font-bold mb-8 shadow-sm border border-brand-light/80 dark:border-gray-700/50"
        >
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <FaLightbulb size={16} />
          </motion.span>
          {t('home.heroBadge', { count: jobCount }) || `Hơn ${jobCount.toLocaleString()}+ việc làm đang chờ bạn`}
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-100 dark:text-white mb-6 leading-tight drop-shadow-md"
        >
          {t('home.heroTitle') || 'Tìm việc làm phù hợp'}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent drop-shadow-sm">
            {t('home.heroSubtitle') || 'Nhanh chóng - Thông minh - Chính xác'}
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-gray-100 dark:text-gray-200 max-w-2xl mx-auto mb-10 font-semibold drop-shadow-md"
        >
          {t('home.heroDesc') || 'Hàng ngàn cơ hội việc làm đang chờ bạn. Tìm kiếm thông minh với AI, ứng tuyển dễ dàng chỉ với vài cú click.'}
        </motion.p>

        <motion.div variants={itemVariants}>
          <SearchForm />
        </motion.div>

        {/* Quick action buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-center gap-6 mt-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/jobs"
              className="group text-sm font-semibold text-gray-800 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 flex items-center gap-2 cursor-pointer bg-white/60 dark:bg-gray-800/40 px-4 py-2 rounded-full backdrop-blur-sm drop-shadow-sm"
            >
              <motion.span
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.3 }}
              >
                <FaBriefcase size={14} />
              </motion.span>
              {t('home.browseAllJobs') || 'Xem tất cả việc làm'}
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/upload-cv"
              className="group text-sm font-semibold text-gray-800 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 flex items-center gap-2 cursor-pointer bg-white/60 dark:bg-gray-800/40 px-4 py-2 rounded-full backdrop-blur-sm drop-shadow-sm"
            >
              <motion.span
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3 }}
              >
                <FaUpload size={14} />
              </motion.span>
              {t('home.uploadCV') || 'Upload CV để được gợi ý'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default HeroSection