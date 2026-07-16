import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { toast } from 'react-toastify'
import AuthLayout from '~/layouts/auth/AuthLayout'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { forgotPassword, isLoading } = useAuth()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email)
      setSubmittedEmail(data.email)
      setIsSubmitted(true)
      toast.success(t('auth.resetPasswordSent') || 'Mã OTP đã được gửi đến email của bạn')
    } catch (error) {
      toast.error(error || t('auth.resetPasswordFailed') || 'Gửi yêu cầu thất bại')
    }
  }

  return (
    <AuthLayout
      title={t('auth.forgotPassword') || 'Quên mật khẩu'}
      subtitle={isSubmitted
        ? t('auth.resetPasswordSentSubtitle') || 'Vui lòng kiểm tra email để đặt lại mật khẩu'
        : t('auth.forgotPasswordSubtitle') || 'Nhập email để nhận mã OTP đặt lại mật khẩu'
      }
      showBack={true}
    >
      {isSubmitted ? (
        <div className="space-y-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
              {t('auth.checkYourEmail') || 'Kiểm tra email của bạn'}
            </h3>
            <p className="text-sm text-brand-text/60 dark:text-gray-400">
              {t('auth.resetPasswordEmailSent') || `Chúng tôi đã gửi mã OTP đến ${submittedEmail}`}
            </p>
          </div>
          <Link
            to="/reset-password"
            className="w-full inline-block text-center px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02]"
          >
            {t('auth.goToResetPassword') || 'Đi đến đặt lại mật khẩu'}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
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
                {t('auth.sending') || 'Đang gửi...'}
              </div>
            ) : (
              t('auth.sendResetLink') || 'Gửi yêu cầu'
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
      )}
    </AuthLayout>
  )
}

export default ForgotPassword