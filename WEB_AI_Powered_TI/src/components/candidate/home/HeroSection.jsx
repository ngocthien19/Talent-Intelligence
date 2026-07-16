import { FaLightbulb, FaBriefcase, FaUpload } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { Link } from 'react-router-dom'
import SearchForm from './SearchForm'

const HeroSection = ({ jobCount }) => {
  const { t } = useLanguage()

  return (
    // 1. Thêm z-20 và bỏ overflow-hidden, rounded-b-[3rem] ở thẻ section
    <section className="relative z-20 py-16 md:py-24 mb-12">

      {/* 2. Wrapper dành riêng cho Background: Chứa overflow-hidden và bo góc */}
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[3rem]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: 'url(\'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop\')' }}
        ></div>

        {/* Overlay: Lớp phủ mờ trong suốt (rgba) kết hợp blur */}
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.2)] dark:bg-[rgba(0,0,0,0.4)] backdrop-blur-[2px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <div className="hero-badge inline-flex items-center gap-2 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md text-brand-primary px-5 py-2.5 rounded-full text-sm font-bold mb-8 shadow-sm border border-brand-light/80 dark:border-gray-700/50">
          <FaLightbulb size={16} className="animate-pulse" />
          {t('home.heroBadge', { count: jobCount }) || `Hơn ${jobCount.toLocaleString()}+ việc làm đang chờ bạn`}
        </div>

        {/* Tiêu đề: Đổi thành text-gray-900 và tăng drop-shadow-md */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-100 dark:text-white mb-6 leading-tight drop-shadow-md">
          {t('home.heroTitle') || 'Tìm việc làm phù hợp'}
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent drop-shadow-sm">
            {t('home.heroSubtitle') || 'Nhanh chóng - Thông minh - Chính xác'}
          </span>
        </h1>

        {/* Mô tả: Đổi thành text-gray-800, font-semibold và drop-shadow-md */}
        <p className="text-lg md:text-xl text-gray-100 dark:text-gray-200 max-w-2xl mx-auto mb-10 font-semibold drop-shadow-md">
          {t('home.heroDesc') || 'Hàng ngàn cơ hội việc làm đang chờ bạn. Tìm kiếm thông minh với AI, ứng tuyển dễ dàng chỉ với vài cú click.'}
        </p>

        <SearchForm />

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
          <Link
            to="/jobs"
            className="group text-sm font-semibold text-gray-800 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 flex items-center gap-2 cursor-pointer bg-white/60 dark:bg-gray-800/40 px-4 py-2 rounded-full backdrop-blur-sm drop-shadow-sm"
          >
            <FaBriefcase size={14} className="group-hover:scale-110 transition-transform" />
            {t('home.browseAllJobs') || 'Xem tất cả việc làm'}
          </Link>
          <Link
            to="/upload-cv"
            className="group text-sm font-semibold text-gray-800 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-all duration-300 flex items-center gap-2 cursor-pointer bg-white/60 dark:bg-gray-800/40 px-4 py-2 rounded-full backdrop-blur-sm drop-shadow-sm"
          >
            <FaUpload size={14} className="group-hover:-translate-y-1 transition-transform" />
            {t('home.uploadCV') || 'Upload CV để được gợi ý'}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HeroSection