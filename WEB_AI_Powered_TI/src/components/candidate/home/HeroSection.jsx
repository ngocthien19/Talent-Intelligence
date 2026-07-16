import { FaLightbulb, FaBriefcase, FaUpload } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { Link } from 'react-router-dom'
import SearchForm from './SearchForm'

const HeroSection = ({ jobCount }) => {
  const { t } = useLanguage()

  return (
    <section className="py-12 md:py-20">
      <div className="text-center max-w-4xl mx-auto">
        <div className="hero-badge inline-flex items-center gap-2 bg-brand-light dark:bg-gray-800 text-brand-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <FaLightbulb size={16} />
          {t('home.heroBadge', { count: jobCount }) || `Hơn ${jobCount.toLocaleString()}+ việc làm đang chờ bạn`}
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-secondary dark:text-white mb-6 leading-tight">
          {t('home.heroTitle') || 'Tìm việc làm phù hợp'}
          <br />
          <span className="text-gradient">{t('home.heroSubtitle') || 'Nhanh chóng - Thông minh - Chính xác'}</span>
        </h1>
        <p className="text-lg md:text-xl text-brand-text dark:text-gray-300 max-w-2xl mx-auto mb-8">
          {t('home.heroDesc') || 'Hàng ngàn cơ hội việc làm đang chờ bạn. Tìm kiếm thông minh với AI, ứng tuyển dễ dàng chỉ với vài cú click.'}
        </p>

        <SearchForm />

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          <Link
            to="/jobs"
            className="quick-action-link text-sm text-brand-text/70 dark:text-gray-400 hover:text-brand-primary transition-all duration-300 flex items-center gap-1 cursor-pointer"
          >
            <FaBriefcase size={14} />
            {t('home.browseAllJobs') || 'Xem tất cả việc làm'}
          </Link>
          <span className="text-brand-text/20 dark:text-gray-600">|</span>
          <Link
            to="/upload-cv"
            className="quick-action-link text-sm text-brand-text/70 dark:text-gray-400 hover:text-brand-primary transition-all duration-300 flex items-center gap-1 cursor-pointer"
          >
            <FaUpload size={14} />
            {t('home.uploadCV') || 'Upload CV để được gợi ý'}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HeroSection