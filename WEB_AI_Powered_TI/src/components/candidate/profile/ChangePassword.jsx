import { useState } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  FaLock,
  FaKey,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaShieldAlt
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { profileApi } from '~/api/candidate/profile.api'

const passwordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu hiện tại')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  newPassword: yup
    .string()
    .required('Vui lòng nhập mật khẩu mới')
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu mới không được vượt quá 50 ký tự')
    .notOneOf([yup.ref('currentPassword')], 'Mật khẩu mới phải khác mật khẩu hiện tại'),
  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu mới')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
})

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const ChangePassword = () => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await profileApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })

      if (response.success) {
        toast.success('Đổi mật khẩu thành công!')
        reset()
      }
    } catch (error) {
      toast.error(error?.message || 'Đổi mật khẩu thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 overflow-hidden"
    >
      <div className="h-1 w-full bg-gradient-to-r from-brand-primary to-brand-accent" />

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-brand-light/30 dark:bg-gray-700/30">
            <FaShieldAlt size={20} className="text-brand-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
              {t('profile.changePassword') || 'Đổi mật khẩu'}
            </h2>
            <p className="text-sm text-brand-text/60 dark:text-gray-400">
              {t('profile.changePasswordDesc') || 'Cập nhật mật khẩu để bảo mật tài khoản của bạn'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              <FaKey size={14} className="inline mr-2 text-brand-text/40" />
              {t('profile.currentPassword') || 'Mật khẩu hiện tại'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder={t('profile.currentPasswordPlaceholder') || 'Nhập mật khẩu hiện tại...'}
                className={`w-full px-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 pr-12 ${
                  errors.currentPassword
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text/40 hover:text-brand-primary transition-colors duration-200 cursor-pointer"
                aria-label={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.currentPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.currentPassword.message}
              </motion.p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              <FaLock size={14} className="inline mr-2 text-brand-text/40" />
              {t('profile.newPassword') || 'Mật khẩu mới'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder={t('profile.newPasswordPlaceholder') || 'Nhập mật khẩu mới...'}
                className={`w-full px-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 pr-12 ${
                  errors.newPassword
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text/40 hover:text-brand-primary transition-colors duration-200 cursor-pointer"
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.newPassword.message}
              </motion.p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              <FaLock size={14} className="inline mr-2 text-brand-text/40" />
              {t('profile.confirmPassword') || 'Xác nhận mật khẩu mới'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('profile.confirmPasswordPlaceholder') || 'Xác nhận mật khẩu mới...'}
                className={`w-full px-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 pr-12 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text/40 hover:text-brand-primary transition-colors duration-200 cursor-pointer"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-brand-light/50 dark:border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isValid || !isDirty}
              className="flex-1 px-6 py-2.5 bg-gradient-brand text-white rounded-lg font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  {t('common.changing') || 'Đang đổi...'}
                </>
              ) : (
                <>
                  <FaCheckCircle size={16} />
                  {t('profile.changePassword') || 'Đổi mật khẩu'}
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => reset()}
              disabled={isLoading || !isDirty}
              className="px-6 py-2.5 border border-brand-light dark:border-gray-700 text-brand-text dark:text-gray-300 rounded-lg font-medium hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {t('common.reset') || 'Đặt lại'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default ChangePassword