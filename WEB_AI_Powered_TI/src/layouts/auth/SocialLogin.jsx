import { FaGoogle } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const SocialLogin = ({ onGoogleLogin }) => {
  const { t } = useLanguage()

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-light dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-800 text-brand-text/60 dark:text-gray-400">
            {t('auth.orContinueWith') || 'Hoặc tiếp tục với'}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={onGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-brand-light dark:border-gray-700 rounded-xl text-brand-text dark:text-gray-300 hover:bg-brand-light/50 dark:hover:bg-gray-700/50 transition-all duration-300 cursor-pointer hover:scale-[1.01]"
        >
          <FaGoogle size={20} className="text-red-500" />
          <span className="font-medium">
            {t('auth.continueWithGoogle') || 'Tiếp tục với Google'}
          </span>
        </button>
      </div>
    </div>
  )
}

export default SocialLogin