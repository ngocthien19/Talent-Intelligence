import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { toast } from 'react-toastify'
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock } from 'react-icons/fa'
import AuthLayout from '~/layouts/auth/AuthLayout'
import SocialLogin from '~/layouts/auth/SocialLogin'

const InputGroup = ({
  id,
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  error,
  validation,
  register,
  isPassword,
  showPwd,
  setShowPwd
}) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-brand-secondary dark:text-gray-200">
        {label}
      </label>
      <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-[1.01]' : ''}`}>
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-text/40 dark:text-gray-500 group-focus-within:text-brand-primary transition-colors duration-300">
          <Icon size={16} />
        </div>
        <input
          id={id}
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          className={`w-full pl-11 pr-${isPassword ? '12' : '4'} py-3 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-brand-light dark:border-gray-700'} bg-gray-50/50 dark:bg-gray-900/50 text-brand-secondary dark:text-white focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all duration-300`}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...register(id, validation)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500 hover:text-brand-primary dark:hover:text-white transition-colors duration-200 cursor-pointer p-1"
          >
            {showPwd ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500 font-medium">{error.message}</p>}
    </div>
  )
}

const Register = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { register: registerUser, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullname: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: ''
    }
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    try {
      const result = await registerUser(data)
      if (result) {
        toast.success(t('auth.registerSuccess') || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực OTP')
        navigate('/verify-otp', { state: { email: data.email } })
      }
    } catch (error) {
      toast.error(error || t('auth.registerFailed') || 'Đăng ký thất bại')
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`
  }

  return (
    <AuthLayout
      title={t('auth.register') || 'Đăng ký'}
      subtitle={t('auth.registerSubtitle') || 'Tạo tài khoản để bắt đầu hành trình tìm việc'}
      showBack={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputGroup
          id="fullname"
          label={t('auth.fullname') || 'Họ tên'}
          icon={FaUser}
          placeholder={t('auth.fullnamePlaceholder') || 'Nguyễn Văn A'}
          error={errors.fullname}
          register={register}
          validation={{
            required: t('auth.fullnameRequired') || 'Vui lòng nhập họ tên'
          }}
        />

        <InputGroup
          id="email"
          type="email"
          label={t('auth.email') || 'Email'}
          icon={FaEnvelope}
          placeholder={t('auth.emailPlaceholder') || 'example@email.com'}
          error={errors.email}
          register={register}
          validation={{
            required: t('auth.emailRequired') || 'Vui lòng nhập email',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: t('auth.emailInvalid') || 'Email không hợp lệ'
            }
          }}
        />

        <InputGroup
          id="phone"
          type="tel"
          label={t('auth.phone') || 'Số điện thoại'}
          icon={FaPhone}
          placeholder={t('auth.phonePlaceholder') || '0901234567'}
          error={errors.phone}
          register={register}
          validation={{
            required: t('auth.phoneRequired') || 'Vui lòng nhập số điện thoại',
            pattern: {
              value: /^[0-9]{10,11}$/,
              message: t('auth.phoneInvalid') || 'Số điện thoại không hợp lệ'
            }
          }}
        />

        <InputGroup
          id="address"
          label={t('auth.address') || 'Địa chỉ'}
          icon={FaMapMarkerAlt}
          placeholder={t('auth.addressPlaceholder') || 'TP. Hồ Chí Minh'}
          error={errors.address}
          register={register}
        />

        <InputGroup
          id="password"
          label={t('auth.password') || 'Mật khẩu'}
          icon={FaLock}
          placeholder={t('auth.passwordPlaceholder') || '••••••••'}
          error={errors.password}
          register={register}
          isPassword
          showPwd={showPassword}
          setShowPwd={setShowPassword}
          validation={{
            required: t('auth.passwordRequired') || 'Vui lòng nhập mật khẩu',
            minLength: {
              value: 6,
              message: t('auth.passwordMinLength') || 'Tối thiểu 6 ký tự'
            }
          }}
        />

        <InputGroup
          id="confirmPassword"
          label={t('auth.confirmPassword') || 'Xác nhận mật khẩu'}
          icon={FaLock}
          placeholder={t('auth.confirmPasswordPlaceholder') || '••••••••'}
          error={errors.confirmPassword}
          register={register}
          isPassword
          showPwd={showConfirmPassword}
          setShowPwd={setShowConfirmPassword}
          validation={{
            required: t('auth.confirmPasswordRequired') || 'Vui lòng xác nhận mật khẩu',
            validate: (val) => val === password || t('auth.passwordMismatch') || 'Mật khẩu không khớp'
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 px-6 py-3.5 bg-gradient-brand text-white rounded-xl font-bold shadow-md hover:shadow-glow hover:-translate-y-0.5 transition-all duration-300 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? t('auth.loading') || 'Đang xử lý...' : t('auth.register') || 'Đăng ký'}
        </button>

        <p className="text-center text-sm font-medium text-brand-text/70 dark:text-gray-400 pt-2">
          {t('auth.haveAccount') || 'Đã có tài khoản?'}{' '}
          <Link
            to="/login"
            className="text-brand-primary hover:text-brand-accent hover:underline underline-offset-2 transition-colors duration-200"
          >
            {t('auth.loginNow') || 'Đăng nhập ngay'}
          </Link>
        </p>
      </form>
      <SocialLogin onGoogleLogin={handleGoogleLogin} />
    </AuthLayout>
  )
}

export default Register