import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa'
import AuthLayout from '~/layouts/auth/AuthLayout'
import SocialLogin from '~/layouts/auth/SocialLogin'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const { login, isLoading, fetchProfile } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const success = params.get('google_success')
    const error = params.get('error')

    if (success === 'true') {
      toast.success('Đăng nhập với Google thành công!')
      navigate('/', { replace: true })
    }

    if (error) {
      toast.error(decodeURIComponent(error) || 'Đăng nhập với Google thất bại')
      navigate('/login', { replace: true })
    }
  }, [location, navigate, fetchProfile])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async (data) => {
    try {
      const result = await login(data)
      if (result) {
        toast.success(t('auth.loginSuccess') || 'Đăng nhập thành công!')
        navigate(result.redirectUrl || '/')
      }
    } catch (error) {
      toast.error(error || t('auth.loginFailed') || 'Đăng nhập thất bại')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`
  }

  return (
    <AuthLayout
      title={t('auth.login') || 'Đăng nhập'}
      subtitle={t('auth.loginSubtitle') || 'Đăng nhập để tiếp tục tìm kiếm công việc mơ ước'}
      showBack={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-semibold text-brand-secondary dark:text-gray-200">
            {t('auth.email') || 'Email'}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-text/40 dark:text-gray-500 group-focus-within:text-brand-primary transition-colors duration-300">
              <FaEnvelope size={16} />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`w-full pl-11 pr-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500/20' : 'border-brand-light dark:border-gray-700'} bg-gray-50/50 dark:bg-gray-900/50 text-brand-secondary dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all duration-300`}
              placeholder={t('auth.emailPlaceholder') || 'example@email.com'}
              {...register('email', {
                required: t('auth.emailRequired') || 'Vui lòng nhập email',
                pattern: { value: /\S+@\S+\.\S+/, message: t('auth.emailInvalid') || 'Email không hợp lệ' }
              })}
            />
          </div>
          {errors.email && <p className="text-sm text-red-500 font-medium">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-semibold text-brand-secondary dark:text-gray-200">
            {t('auth.password') || 'Mật khẩu'}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-text/40 dark:text-gray-500 group-focus-within:text-brand-primary transition-colors duration-300">
              <FaLock size={16} />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              className={`w-full pl-11 pr-12 py-3.5 rounded-xl border ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-brand-light dark:border-gray-700'} bg-gray-50/50 dark:bg-gray-900/50 text-brand-secondary dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all duration-300`}
              placeholder={t('auth.passwordPlaceholder') || '••••••••'}
              {...register('password', { required: t('auth.passwordRequired') || 'Vui lòng nhập mật khẩu' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500 hover:text-brand-primary dark:hover:text-white transition-colors duration-200 cursor-pointer p-1"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-500 font-medium">{errors.password.message}</p>}
        </div>

        {/* Forgot password */}
        <div className="flex items-center justify-end pb-2">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-primary hover:text-brand-accent hover:underline underline-offset-2 transition-all duration-200"
          >
            {t('auth.forgotPassword') || 'Quên mật khẩu?'}
          </Link>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3.5 bg-gradient-brand text-white rounded-xl font-bold text-base shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('auth.loading') || 'Đang xử lý...'}
            </div>
          ) : (
            t('auth.login') || 'Đăng nhập')
          }
        </button>

        {/* Register link */}
        <p className="text-center text-sm font-medium text-brand-text/70 dark:text-gray-400 pt-2">
          {t('auth.noAccount') || 'Chưa có tài khoản?'}{' '}
          <Link
            to="/register"
            className="text-brand-primary hover:text-brand-accent hover:underline underline-offset-2 transition-all duration-200"
          >
            {t('auth.registerNow') || 'Đăng ký ngay'}
          </Link>
        </p>
      </form>

      <SocialLogin onGoogleLogin={handleGoogleLogin} />
    </AuthLayout>
  )
}

export default Login