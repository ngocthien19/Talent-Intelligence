import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { FaRobot, FaRocket, FaUpload, FaComments, FaArrowRight } from 'react-icons/fa'

const CTASection = () => {
  const { t } = useLanguage()

  return (
    <section className="w-full py-24 bg-white dark:bg-slate-900 border-t border-brand-light/50 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative cta-section rounded-[2rem] overflow-hidden p-8 md:p-16 text-center text-white shadow-2xl">
          {/* Background Image cho CTA */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay hover:scale-105 transition-transform duration-1000"
            style={{ backgroundImage: 'url(\'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop\')' }}
          ></div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-brand-primary via-brand-primary/90 to-brand-accent"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 mb-6 bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20">
              <FaRobot className="text-4xl animate-bounce text-white" />
              <FaRocket className="text-4xl animate-pulse text-brand-light" />
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight drop-shadow-sm">
              {t('home.ctaTitle') || 'Để AI giúp bạn tìm việc phù hợp nhất'}
            </h2>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
              {t('home.ctaDesc') || 'Upload CV của bạn, AI sẽ phân tích và gợi ý những công việc phù hợp nhất với kỹ năng và kinh nghiệm của bạn.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
              <Link
                to="/upload-cv"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-primary rounded-xl font-bold hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full sm:w-auto"
              >
                <FaUpload size={18} />
                {t('home.uploadCV') || 'Upload CV ngay'}
                <FaArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/mock-interview"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white/60 rounded-xl font-bold hover:bg-white/10 hover:border-white hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full sm:w-auto"
              >
                <FaComments size={18} />
                {t('home.tryMockInterview') || 'Thử Mock Interview'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection