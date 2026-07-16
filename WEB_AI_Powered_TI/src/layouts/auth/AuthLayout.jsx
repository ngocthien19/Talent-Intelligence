import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'

const AuthLayout = ({ children, title, subtitle, showBack = false }) => {
  const { t } = useLanguage()

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-brand-bg dark:bg-[#020817] overflow-hidden">
      {/* Decorative Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-primary/20 dark:bg-brand-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-accent/20 dark:bg-brand-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-md w-full">
        {/* Container với box-shadow bọc toàn bộ nội dung */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-bold border border-white/50 dark:border-gray-700/50 p-8 sm:p-10 transition-all duration-300 hover:shadow-glow">

          {/* Header - Logo, Title, Subtitle */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center gap-3 w-full group">
              <div className="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-2xl">JM</span>
              </div>
              <span className="text-2xl font-extrabold text-brand-secondary dark:text-white tracking-tight">
                Job<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">Mind</span>
              </span>
            </Link>
            <div className="mt-6 space-y-2">
              <h2 className="text-3xl font-extrabold text-brand-secondary dark:text-white tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-base text-brand-text/70 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Form Content */}
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout