import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { toast } from 'react-toastify'
import AuthLayout from '~/layouts/auth/AuthLayout'

const VerifyOtp = () => {
  // Logic giữ nguyên như cũ[cite: 12]
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const { verifyOtp, resendOtp, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [timer, setTimer] = useState(120)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef([])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: { otp1: '', otp2: '', otp3: '', otp4: '', otp5: '', otp6: '' }
  })

  useEffect(() => {
    const emailFromState = location.state?.email
    if (emailFromState) {
      setEmail(emailFromState)
    } else {
      toast.error('Vui lòng đăng ký trước khi xác thực OTP')
      navigate('/register')
    }
  }, [location, navigate])

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000)
      return () => clearInterval(interval)
    } else {
      setCanResend(true)
    }
  }, [timer])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    setValue(`otp${index + 1}`, value.slice(-1))
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    const currentValue = inputRefs.current[index]?.value
    if (e.key === 'Backspace' && !currentValue && index > 0) inputRefs.current[index - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d{6}$/.test(pastedData)) {
      pastedData.split('').forEach((char, index) => setValue(`otp${index + 1}`, char))
      inputRefs.current[5]?.focus()
    }
  }

  const onSubmit = async (data) => {
    const otpCode = Object.values(data).join('')
    if (otpCode.length !== 6) return toast.warning(t('auth.otpInvalid') || 'Vui lòng nhập đủ 6 số OTP')
    try {
      const result = await verifyOtp({ email, otpCode })
      if (result) {
        toast.success(t('auth.otpVerified') || 'Xác thực thành công!')
        navigate('/login')
      }
    } catch (error) { toast.error(error || t('auth.otpVerificationFailed') || 'Xác thực OTP thất bại') }
  }

  const handleResendOtp = async () => {
    try {
      await resendOtp(email)
      toast.success(t('auth.otpResent') || 'Đã gửi lại OTP thành công!')
      setTimer(120); setCanResend(false)
      for (let i = 0; i < 6; i++) setValue(`otp${i + 1}`, '')
      inputRefs.current[0]?.focus()
    } catch (error) { toast.error(error || t('auth.resendFailed') || 'Gửi lại OTP thất bại') }
  }

  return (
    <AuthLayout
      title={t('auth.verifyOtp') || 'Xác thực OTP'}
      subtitle={t('auth.verifyOtpSubtitle') || `Nhập mã OTP đã được gửi đến ${email}`}
      showBack={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-center gap-2 sm:gap-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-3xl font-bold rounded-xl border ${errors[`otp${index + 1}`] ? 'border-red-500 focus:ring-red-500/20' : 'border-brand-light dark:border-gray-700'} bg-gray-50/50 dark:bg-gray-900/50 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-300 dark:text-white shadow-sm`}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              autoFocus={index === 0}
              {...register(`otp${index + 1}`, { required: true, pattern: /^\d$/ })}
            />
          ))}
        </div>

        <div className="text-center bg-brand-light/30 dark:bg-gray-800/50 py-3 rounded-lg border border-brand-light/50 dark:border-gray-700">
          {timer > 0 ? (
            <p className="text-sm font-medium text-brand-text/70 dark:text-gray-400">
              {t('auth.otpResendTimer') || 'Gửi lại mã sau'}{' '}
              <span className="font-bold text-brand-primary text-base ml-1">
                {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </span>
            </p>
          ) : (
            <button type="button" onClick={handleResendOtp} disabled={!canResend || isLoading} className="text-sm font-bold text-brand-primary hover:text-brand-accent transition-colors duration-200 cursor-pointer disabled:opacity-50">
              {t('auth.resendOtp') || 'Gửi lại mã OTP ngay'}
            </button>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="w-full px-6 py-3.5 bg-gradient-brand text-white rounded-xl font-bold shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70">
          {isLoading ? t('auth.verifying') || 'Đang xác thực...' : t('auth.verify') || 'Xác thực'}
        </button>

        <p className="text-center text-sm font-medium text-brand-text/70 dark:text-gray-400">
          {t('auth.backToLogin') || 'Quay lại'} <Link to="/login" className="text-brand-primary hover:text-brand-accent transition-colors duration-200">{t('auth.login') || 'Đăng nhập'}</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export default VerifyOtp