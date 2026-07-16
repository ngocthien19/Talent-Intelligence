import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { FaRobot, FaRocket, FaUpload, FaComments, FaArrowRight } from 'react-icons/fa'

const CTASection = () => {
  const { t } = useLanguage()

  return (
    <section className="py-12">
      <div className="cta-section bg-gradient-brand rounded-2xl p-8 md:p-12 text-center text-white max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FaRobot className="text-3xl animate-bounce" />
          <FaRocket className="text-3xl animate-pulse" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {t('home.ctaTitle') || 'Để AI giúp bạn tìm việc phù hợp nhất'}
        </h2>
        <p className="text-white/80 mb-6 max-w-2xl mx-auto">
          {t('home.ctaDesc') || 'Upload CV của bạn, AI sẽ phân tích và gợi ý những công việc phù hợp nhất với kỹ năng và kinh nghiệm của bạn.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/upload-cv"
            className="cta-btn inline-flex items-center gap-2 px-8 py-3 bg-white text-brand-primary rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <FaUpload size={18} />
            {t('home.uploadCV') || 'Upload CV ngay'}
            <FaArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to="/mock-interview"
            className="cta-btn-outline inline-flex items-center gap-2 px-8 py-3 bg-white/20 text-white border-2 border-white/50 rounded-lg font-medium hover:bg-white/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            <FaComments size={18} />
            {t('home.tryMockInterview') || 'Thử Mock Interview'}
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CTASection