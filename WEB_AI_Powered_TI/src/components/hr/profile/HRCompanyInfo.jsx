import { useState, useRef } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  FaBuilding,
  FaGlobe,
  FaIndustry,
  FaMapMarkerAlt,
  FaUsers,
  FaCamera,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaImage
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { hrProfileApi } from '~/api/hr/hrProfile.api'

const companySchema = yup.object({
  name: yup
    .string()
    .required('Vui lòng nhập tên công ty')
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(255, 'Tên công ty không được vượt quá 255 ký tự'),
  description: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
  cultureDescription: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .max(1000, 'Mô tả văn hóa không được vượt quá 1000 ký tự'),
  industry: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .max(100, 'Ngành nghề không được vượt quá 100 ký tự'),
  website: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .url('Website không hợp lệ'),
  address: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự'),
  size: yup
    .string()
    .nullable()
    .transform((value) => value || null)
    .oneOf(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], 'Quy mô không hợp lệ')
})

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-200', label: '51-200' },
  { value: '201-500', label: '201-500' },
  { value: '501-1000', label: '501-1000' },
  { value: '1000+', label: '1000+' }
]

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

const HRCompanyInfo = ({ company, onUpdateSuccess, fetchProfile }) => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingBanner, setIsUploadingBanner] = useState(false)
  const logoInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch
  } = useForm({
    resolver: yupResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      description: company?.description || '',
      cultureDescription: company?.culture_description || '',
      industry: company?.industry || '',
      website: company?.website || '',
      address: company?.address || '',
      size: company?.size || ''
    }
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await hrProfileApi.updateCompany(data)
      if (response.success) {
        toast.success(t('hr.profile.companyUpdateSuccess') || 'Cập nhật thông tin công ty thành công!')
        // Gọi fetchProfile để cập nhật Redux store
        await fetchProfile()
        await onUpdateSuccess()
        reset(data)
      }
    } catch (error) {
      toast.error(error?.message || t('hr.profile.companyUpdateFailed') || 'Cập nhật thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file, type) => {
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error(t('hr.profile.invalidImageType') || 'Vui lòng chọn ảnh định dạng JPG, PNG hoặc WebP')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('hr.profile.imageTooLarge') || 'Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB')
      return
    }

    const setLoading = type === 'logo' ? setIsUploadingLogo : setIsUploadingBanner

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append(type, file)

      const response = await hrProfileApi.uploadCompanyFiles(formData)
      if (response.success) {
        toast.success(t('hr.profile.fileUploadSuccess') || 'Cập nhật thành công!')
        await onUpdateSuccess()
      }
    } catch (error) {
      toast.error(error?.message || t('hr.profile.fileUploadFailed') || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const logoUrl = company?.logo?.secure_url || null
  const bannerUrl = company?.banner?.secure_url || null

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 overflow-hidden"
    >
      <div className="h-1 w-full bg-gradient-to-r from-brand-primary to-brand-accent" />

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <FaBuilding size={20} className="text-brand-primary" />
          <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
            {t('hr.profile.company') || 'Thông tin công ty'}
          </h2>
        </div>

        {/* Banner & Logo */}
        <div className="mb-8 pb-6 border-b border-brand-light/50 dark:border-gray-700/50">
          {/* Banner */}
          <div className="relative group mb-4">
            <div className="w-full h-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl overflow-hidden">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Company Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-text/40 dark:text-gray-500">
                  <FaImage size={48} />
                </div>
              )}
            </div>
            <label
              htmlFor="banner-upload"
              className="absolute bottom-3 right-3 p-2 bg-brand-primary text-white rounded-full cursor-pointer hover:bg-brand-secondary transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
            >
              {isUploadingBanner ? (
                <FaSpinner className="animate-spin" size={14} />
              ) : (
                <FaCamera size={14} />
              )}
            </label>
            <input
              ref={bannerInputRef}
              id="banner-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFileUpload(e.target.files[0], 'banner')}
              className="hidden"
              disabled={isUploadingBanner}
            />
          </div>

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold border-2 border-brand-light dark:border-gray-700">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaBuilding size={24} />
                )}
              </div>
              <label
                htmlFor="logo-upload"
                className="absolute -bottom-1 -right-1 p-1.5 bg-brand-primary text-white rounded-full cursor-pointer hover:bg-brand-secondary transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
              >
                {isUploadingLogo ? (
                  <FaSpinner className="animate-spin" size={10} />
                ) : (
                  <FaCamera size={10} />
                )}
              </label>
              <input
                ref={logoInputRef}
                id="logo-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileUpload(e.target.files[0], 'logo')}
                className="hidden"
                disabled={isUploadingLogo}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-brand-secondary dark:text-white">
                {t('hr.profile.logoAndBanner') || 'Logo & Banner'}
              </p>
              <p className="text-xs text-brand-text/40 dark:text-gray-500">
                {t('hr.profile.clickToUpload') || 'Click vào biểu tượng camera để tải ảnh lên'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              {t('hr.profile.companyName') || 'Tên công ty'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FaBuilding size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
              <input
                {...register('name')}
                type="text"
                placeholder={t('hr.profile.companyNamePlaceholder') || 'Nhập tên công ty...'}
                className={`w-full pl-10 pr-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/50'
                    : 'border-brand-light dark:border-gray-700'
                }`}
              />
            </div>
            {errors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.name.message}
              </motion.p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              {t('hr.profile.description') || 'Mô tả công ty'}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder={t('hr.profile.descriptionPlaceholder') || 'Nhập mô tả công ty...'}
              className={`w-full px-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 resize-y ${
                errors.description
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-brand-light dark:border-gray-700'
              }`}
            />
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.description.message}
              </motion.p>
            )}
          </div>

          {/* Culture Description */}
          <div>
            <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
              {t('hr.profile.cultureDescription') || 'Văn hóa công ty'}
            </label>
            <textarea
              {...register('cultureDescription')}
              rows={3}
              placeholder={t('hr.profile.cultureDescriptionPlaceholder') || 'Nhập mô tả văn hóa công ty...'}
              className={`w-full px-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 resize-y ${
                errors.cultureDescription
                  ? 'border-red-500 focus:ring-red-500/50'
                  : 'border-brand-light dark:border-gray-700'
              }`}
            />
            {errors.cultureDescription && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
              >
                <FaExclamationCircle size={14} />
                {errors.cultureDescription.message}
              </motion.p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
                {t('hr.profile.industry') || 'Ngành nghề'}
              </label>
              <div className="relative">
                <FaIndustry size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
                <input
                  {...register('industry')}
                  type="text"
                  placeholder={t('hr.profile.industryPlaceholder') || 'Nhập ngành nghề...'}
                  className={`w-full pl-10 pr-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 ${
                    errors.industry
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-brand-light dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.industry && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
                >
                  <FaExclamationCircle size={14} />
                  {errors.industry.message}
                </motion.p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
                {t('hr.profile.website') || 'Website'}
              </label>
              <div className="relative">
                <FaGlobe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
                <input
                  {...register('website')}
                  type="url"
                  placeholder={t('hr.profile.websitePlaceholder') || 'https://example.com'}
                  className={`w-full pl-10 pr-4 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 ${
                    errors.website
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-brand-light dark:border-gray-700'
                  }`}
                />
              </div>
              {errors.website && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
                >
                  <FaExclamationCircle size={14} />
                  {errors.website.message}
                </motion.p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
                {t('hr.profile.address') || 'Địa chỉ'}
              </label>
              <div className="relative">
                <FaMapMarkerAlt size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
                <input
                  {...register('address')}
                  type="text"
                  placeholder={t('hr.profile.addressPlaceholder') || 'Nhập địa chỉ...'}
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

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-brand-secondary dark:text-white mb-1.5">
                {t('hr.profile.size') || 'Quy mô'}
              </label>
              <div className="relative">
                <FaUsers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" />
                <select
                  {...register('size')}
                  className={`w-full pl-10 pr-8 py-2.5 bg-brand-bg dark:bg-gray-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white appearance-none ${
                    errors.size
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-brand-light dark:border-gray-700'
                  }`}
                >
                  <option value="">{t('hr.profile.selectSize') || 'Chọn quy mô...'}</option>
                  {COMPANY_SIZES.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.size && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1.5 text-sm text-red-500 flex items-center gap-1"
                >
                  <FaExclamationCircle size={14} />
                  {errors.size.message}
                </motion.p>
              )}
            </div>
          </div>

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

export default HRCompanyInfo