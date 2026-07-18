import { useState, useRef } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaEdit
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { profileApi } from '~/api/candidate/profile.api'

// Validation schema với validate số điện thoại
const profileSchema = yup.object({
  fullname: yup
    .string()
    .required('Vui lòng nhập họ tên')
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng'),
  phone: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .test('phone-valid', 'Số điện thoại không hợp lệ (phải có 10-11 chữ số, bắt đầu bằng 0)', (value) => {
      if (!value) return true
      return /^(0[3-9][0-9]{8,9})$/.test(value)
    }),
  address: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự')
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

const ProfileInfo = ({ profile, onUpdateSuccess }) => {
  const { t } = useLanguage()
  const { user, fetchProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullname: profile?.fullname || user?.fullname || '',
      phone: profile?.phone || user?.phone || '',
      address: profile?.address || user?.address || ''
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await profileApi.updateProfile(data)
      if (response.success) {
        toast.success('Cập nhật thông tin thành công!')
        await onUpdateSuccess()
        reset(data)
      }
    } catch (error) {
      toast.error(error?.message || 'Cập nhật thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await profileApi.uploadAvatar(formData)
      if (response.success) {
        toast.success('Cập nhật avatar thành công!')
        await fetchProfile()
        await onUpdateSuccess()
      }
    } catch (error) {
      toast.error(error?.message || 'Cập nhật avatar thất bại')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const avatarUrl = profile?.avatar?.secure_url || user?.avatar?.secure_url || null
  const displayName = profile?.fullname || user?.fullname || 'User'
  const userEmail = profile?.email || user?.email || ''

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
          <FaUser size={20} className="text-brand-primary" />
          <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
            {t('profile.info') || 'Thông tin cá nhân'}
          </h2>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-6 border-b border-brand-light/50 dark:border-gray-700/50">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold border-2 border-brand-light dark:border-gray-700">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="uppercase">{displayName.charAt(0)}</span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-1.5 bg-brand-primary text-white rounded-full cursor-pointer hover:bg-brand-secondary transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
            >
              {isUploadingAvatar ? (
                <FaSpinner className="animate-spin" size={12} />
              ) : (
                <FaCamera size={12} />
              )}
            </label>
            <input
              ref={fileInputRef}
              id="avatar-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className="hidden"
              disabled={isUploadingAvatar}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">
              {displayName}
            </h3>
            <p className="text-sm text-brand-text/60 dark:text-gray-400 flex items-center gap-1">
              <FaEnvelope size={12} />
              {userEmail}
            </p>
            <p className="text-xs text-brand-text/40 dark:text-gray-500 mt-0.5">
              {t('profile.clickToChangeAvatar') || 'Click vào camera để đổi avatar'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Fullname */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              {t('profile.fullname') || 'Họ tên'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
              <input
                {...register('fullname')}
                type="text"
                placeholder={t('profile.fullnamePlaceholder') || 'Nhập họ tên...'}
                className={`w-full pl-10 pr-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 ${
                  errors.fullname
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
            </div>
            {errors.fullname && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.fullname.message}
              </motion.p>
            )}
          </div>

          {/* Email - Readonly */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              {t('profile.email') || 'Email'}
            </label>
            <div className="relative">
              <FaEnvelope size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
              <input
                type="email"
                value={userEmail}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-not-allowed text-brand-text/60 dark:text-gray-400"
              />
            </div>
            <p className="text-xs text-brand-text/40 dark:text-gray-500 mt-1">
              {t('profile.emailReadonly') || 'Email không thể thay đổi'}
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              {t('profile.phone') || 'Số điện thoại'}
            </label>
            <div className="relative">
              <FaPhone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
              <input
                {...register('phone')}
                type="tel"
                placeholder={t('profile.phonePlaceholder') || 'Nhập số điện thoại...'}
                className={`w-full pl-10 pr-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
            </div>
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.phone.message}
              </motion.p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              {t('profile.address') || 'Địa chỉ'}
            </label>
            <div className="relative">
              <FaMapMarkerAlt size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
              <input
                {...register('address')}
                type="text"
                placeholder={t('profile.addressPlaceholder') || 'Nhập địa chỉ...'}
                className={`w-full pl-10 pr-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 ${
                  errors.address
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
            </div>
            {errors.address && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.address.message}
              </motion.p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-brand-light/50 dark:border-gray-700/50">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isDirty}
              className="cursor-pointer flex-1 px-6 py-2.5 bg-gradient-brand text-white rounded-lg font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin" size={16} />
                  {t('common.saving') || 'Đang lưu...'}
                </>
              ) : (
                <>
                  <FaCheckCircle size={16} />
                  {t('common.save') || 'Lưu thay đổi'}
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => reset()}
              disabled={isLoading || !isDirty}
              className="cursor-pointer px-6 py-2.5 border border-brand-light dark:border-gray-700 text-brand-text dark:text-gray-300 rounded-lg font-medium hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.reset') || 'Đặt lại'}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default ProfileInfo