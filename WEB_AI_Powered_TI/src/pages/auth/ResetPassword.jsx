import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import AuthLayout from '~/layouts/auth/AuthLayout'

const ResetPassword = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const { resetPassword, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      otpCode: '',
      password: '',
      confirmPassword: ''
    }
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      const result = await resetPassword({
        email: data.email,
        otpCode: data.otpCode,
        password: data.password
      })
      if (result) {
        toast.success(t('auth.resetPasswordSuccess') || 'Đặt lại mật khẩu thành công!')
        navigate('/login')
      }
    } catch (error) {
      toast.error(error || t('auth.resetPasswordFailed') || 'Đặt lại mật khẩu thất bại')
    }
  }

  return (
    <AuthLayout
      title={t('auth.resetPassword') || 'Đặt lại mật khẩu'}
      subtitle={t('auth.resetPasswordSubtitle') || 'Nhập OTP và mật khẩu mới để đặt lại mật khẩu'}
      showBack={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-secondary dark:text-white mb-1">
            {t('auth.email') || 'Email'}
          </label>
          <input
            id="email"
            type="email"
            className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-brand-light dark:border-gray-700'} bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 dark:text-white`}
            placeholder={t('auth.emailPlaceholder') || 'example@email.com'}
            {...register('email', {
              required: t('auth.emailRequired') || 'Vui lòng nhập email',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: t('auth.emailInvalid') || 'Email không hợp lệ'
              }
            })}
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
        </div>

        {/* OTP Code */}
        <div>
          <label htmlFor="otpCode" className="block text-sm font-medium text-brand-secondary dark:text-white mb-1">
            {t('auth.otpCode') || 'Mã OTP'}
          </label>
          <input
            id="otpCode"
            type="text"
            inputMode="numeric"
            className={`w-full px-4 py-3 rounded-xl border ${errors.otpCode ? 'border-red-500' : 'border-brand-light dark:border-gray-700'} bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 dark:text-white`}
            placeholder={t('auth.otpCodePlaceholder') || '123456'}
            {...register('otpCode', {
              required: t('auth.otpCodeRequired') || 'Vui lòng nhập mã OTP',
              pattern: {
                value: /^\d{6}$/,
                message: t('auth.otpCodeInvalid') || 'Mã OTP phải là 6 chữ số'
              }
            })}
          />
          {errors.otpCode && <p className="mt-1 text-sm text-red-500">{errors.otpCode.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-secondary dark:text-white mb-1">
            {t('auth.newPassword') || 'Mật khẩu mới'}
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-brand-light dark:border-gray-700'} bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 dark:text-white pr-12`}
              placeholder={t('auth.passwordPlaceholder') || '••••••••'}
              {...register('password', {
                required: t('auth.passwordRequired') || 'Vui lòng nhập mật khẩu mới',
                minLength: {
                  value: 6,
                  message: t('auth.passwordMinLength') || 'Mật khẩu phải có ít nhất 6 ký tự'
                }
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-secondary dark:text-white mb-1">
            {t('auth.confirmPassword') || 'Xác nhận mật khẩu'}
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-brand-light dark:border-gray-700'} bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-200 dark:text-white pr-12`}
              placeholder={t('auth.confirmPasswordPlaceholder') || '••••••••'}
              {...register('confirmPassword', {
                required: t('auth.confirmPasswordRequired') || 'Vui lòng xác nhận mật khẩu',
                validate: (value) => value === password || t('auth.passwordMismatch') || 'Mật khẩu không khớp'
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-400 hover:text-brand-primary dark:hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t('auth.loading') || 'Đang xử lý...'}
            </div>
          ) : (
            t('auth.resetPassword') || 'Đặt lại mật khẩu'
          )}
        </button>

        <p className="text-center text-sm text-brand-text/60 dark:text-gray-400">
          {t('auth.backToLogin') || 'Quay lại'}{' '}
          <Link
            to="/login"
            className="font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-white transition-colors duration-200"
          >
            {t('auth.login') || 'Đăng nhập'}
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword