// src/pages/hr/jobs/components/JobFormModal.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { FaTimes, FaPlus } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import {
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  getExperienceLabel,
  getEmploymentLabel
} from '~/utils/constant'

// Lọc bỏ option "Tất cả" cho form (value rỗng)
const EXPERIENCE_OPTIONS = EXPERIENCE_LEVELS.filter(opt => opt.value !== '')
const EMPLOYMENT_OPTIONS = EMPLOYMENT_TYPES.filter(opt => opt.value !== '')

const JobFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingJob,
  categories = [],
  isSubmitting = false
}) => {
  const { t } = useLanguage()
  const [skillInput, setSkillInput] = useState('')
  const [niceSkillInput, setNiceSkillInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch,
    reset
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      benefits: '',
      requiredSkills: [],
      niceToHaveSkills: [],
      experienceLevel: '',
      employmentType: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      salaryCurrency: 'VND',
      categoryId: '',
      isActive: true
    }
  })

  const requiredSkills = watch('requiredSkills') || []
  const niceToHaveSkills = watch('niceToHaveSkills') || []

  useEffect(() => {
    if (isOpen) {
      if (editingJob) {
        reset({
          title: editingJob.title || '',
          description: editingJob.description || '',
          requirements: editingJob.requirements || '',
          benefits: editingJob.benefits || '',
          requiredSkills: editingJob.required_skills || [],
          niceToHaveSkills: editingJob.nice_to_have_skills || [],
          experienceLevel: editingJob.experience_level || '',
          employmentType: editingJob.employment_type || '',
          location: editingJob.location || '',
          salaryMin: editingJob.salary_range?.min || '',
          salaryMax: editingJob.salary_range?.max || '',
          salaryCurrency: editingJob.salary_range?.currency || 'VND',
          categoryId: editingJob.category_id || '',
          isActive: editingJob.is_active !== undefined ? editingJob.is_active : true
        })
      } else {
        reset({
          title: '',
          description: '',
          requirements: '',
          benefits: '',
          requiredSkills: [],
          niceToHaveSkills: [],
          experienceLevel: '',
          employmentType: '',
          location: '',
          salaryMin: '',
          salaryMax: '',
          salaryCurrency: 'VND',
          categoryId: '',
          isActive: true
        })
      }
      setSkillInput('')
      setNiceSkillInput('')
    }
  }, [isOpen, editingJob, reset])

  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !requiredSkills.includes(skill)) {
      setValue('requiredSkills', [...requiredSkills, skill])
      setSkillInput('')
    }
  }

  const addNiceSkill = () => {
    const skill = niceSkillInput.trim()
    if (skill && !niceToHaveSkills.includes(skill)) {
      setValue('niceToHaveSkills', [...niceToHaveSkills, skill])
      setNiceSkillInput('')
    }
  }

  const removeSkill = (skill) => {
    setValue('requiredSkills', requiredSkills.filter(s => s !== skill))
  }

  const removeNiceSkill = (skill) => {
    setValue('niceToHaveSkills', niceToHaveSkills.filter(s => s !== skill))
  }

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  const handleNiceSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addNiceSkill()
    }
  }

  const onFormSubmit = (data) => {
    const submitData = {
      title: data.title.trim(),
      description: data.description.trim(),
      requirements: data.requirements?.trim() || '',
      benefits: data.benefits?.trim() || '',
      requiredSkills: data.requiredSkills || [],
      niceToHaveSkills: data.niceToHaveSkills || [],
      experienceLevel: data.experienceLevel || undefined,
      employmentType: data.employmentType || undefined,
      location: data.location?.trim() || '',
      salaryRange: {
        min: data.salaryMin ? Number(data.salaryMin) : undefined,
        max: data.salaryMax ? Number(data.salaryMax) : undefined,
        currency: data.salaryCurrency || 'VND'
      },
      categoryId: data.categoryId,
      isActive: data.isActive
    }

    onSubmit(submitData)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-brand-light/50 dark:border-gray-700">
              <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
                {editingJob ? t('hr.job.editTitle') || 'Chỉnh sửa công việc' : t('hr.job.addTitle') || 'Thêm công việc mới'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-brand-light/30 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <FaTimes size={18} className="text-brand-text/60 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                  {t('hr.job.title') || 'Tiêu đề'} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title', {
                    required: t('hr.job.validation.titleRequired') || 'Vui lòng nhập tiêu đề'
                  })}
                  type="text"
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                    errors.title ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                  }`}
                  placeholder={t('hr.job.titlePlaceholder') || 'Nhập tiêu đề công việc...'}
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                  {t('hr.job.category') || 'Danh mục'} <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('categoryId', {
                    required: t('hr.job.validation.categoryRequired') || 'Vui lòng chọn danh mục'
                  })}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                    errors.categoryId ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                  }`}
                >
                  <option value="">{t('hr.job.selectCategory') || 'Chọn danh mục...'}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                  {t('hr.job.description') || 'Mô tả'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('description', {
                    required: t('hr.job.validation.descriptionRequired') || 'Vui lòng nhập mô tả'
                  })}
                  rows={4}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                    errors.description ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                  }`}
                  placeholder={t('hr.job.descriptionPlaceholder') || 'Nhập mô tả công việc...'}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              {/* Requirements & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                    {t('hr.job.requirements') || 'Yêu cầu'}
                  </label>
                  <textarea
                    {...register('requirements')}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    placeholder={t('hr.job.requirementsPlaceholder') || 'Nhập yêu cầu...'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                    {t('hr.job.benefits') || 'Quyền lợi'}
                  </label>
                  <textarea
                    {...register('benefits')}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    placeholder={t('hr.job.benefitsPlaceholder') || 'Nhập quyền lợi...'}
                  />
                </div>
              </div>

              {/* Experience & Employment Type - Sử dụng từ constant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                    {t('hr.job.experienceLevel') || 'Cấp bậc'}
                  </label>
                  <select
                    {...register('experienceLevel')}
                    className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                  >
                    <option value="">{t('hr.job.selectExperience') || 'Chọn cấp bậc...'}</option>
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {getExperienceLabel(opt.value, t)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                    {t('hr.job.employmentType') || 'Loại hình'}
                  </label>
                  <select
                    {...register('employmentType')}
                    className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                  >
                    <option value="">{t('hr.job.selectEmployment') || 'Chọn loại hình...'}</option>
                    {EMPLOYMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {getEmploymentLabel(opt.value, t)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                    {t('hr.job.location') || 'Địa điểm'}
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    placeholder={t('hr.job.locationPlaceholder') || 'Nhập địa điểm...'}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                    {t('hr.job.salary') || 'Mức lương'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      {...register('salaryMin', {
                        validate: (value) => {
                          if (!value) return true
                          const min = Number(value)
                          const max = Number(getValues('salaryMax'))
                          if (min < 0) return t('hr.job.validation.salaryPositive') || 'Mức lương phải là số dương'
                          if (max && min > max) return t('hr.job.validation.salaryMinMax') || 'Mức lương tối thiểu không được lớn hơn tối đa'
                          return true
                        }
                      })}
                      type="number"
                      min="0"
                      className={`w-1/3 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                        errors.salaryMin ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                      }`}
                      placeholder={t('hr.job.min') || 'Tối thiểu'}
                    />
                    <span className="text-brand-text/60 dark:text-gray-400">-</span>
                    <input
                      {...register('salaryMax', {
                        validate: (value) => {
                          if (!value) return true
                          const max = Number(value)
                          const min = Number(getValues('salaryMin'))
                          if (max < 0) return t('hr.job.validation.salaryPositive') || 'Mức lương phải là số dương'
                          if (min && max < min) return t('hr.job.validation.salaryMinMax') || 'Mức lương tối đa không được nhỏ hơn tối thiểu'
                          return true
                        }
                      })}
                      type="number"
                      min="0"
                      className={`w-1/3 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                        errors.salaryMax ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                      }`}
                      placeholder={t('hr.job.max') || 'Tối đa'}
                    />
                    <select
                      {...register('salaryCurrency')}
                      className="w-1/3 px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    >
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  {errors.salaryMin && <p className="text-xs text-red-500 mt-1">{errors.salaryMin.message}</p>}
                  {errors.salaryMax && <p className="text-xs text-red-500 mt-1">{errors.salaryMax.message}</p>}
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                  {t('hr.job.requiredSkills') || 'Kỹ năng bắt buộc'} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    className={`flex-1 px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                      errors.requiredSkills ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                    }`}
                    placeholder={t('hr.job.skillPlaceholder') || 'Nhập kỹ năng và nhấn Enter...'}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                {errors.requiredSkills && <p className="text-xs text-red-500 mt-1">{errors.requiredSkills.message}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Nice to Have Skills */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1">
                  {t('hr.job.niceToHaveSkills') || 'Kỹ năng thêm'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={niceSkillInput}
                    onChange={(e) => setNiceSkillInput(e.target.value)}
                    onKeyDown={handleNiceSkillKeyDown}
                    className="flex-1 px-3 py-2 text-sm border border-brand-light/50 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200"
                    placeholder={t('hr.job.skillPlaceholder') || 'Nhập kỹ năng và nhấn Enter...'}
                  />
                  <button
                    type="button"
                    onClick={addNiceSkill}
                    className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {niceToHaveSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400 rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeNiceSkill(skill)}
                        className="hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <FaTimes size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Active status */}
              <div className="flex items-center gap-3">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                />
                <label className="text-sm font-medium text-brand-secondary dark:text-white">
                  {t('hr.job.active') || 'Đang hoạt động'}
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-light/50 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white transition-colors cursor-pointer"
                >
                  {t('common.cancel') || 'Hủy'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t('common.loading') || 'Đang xử lý...'}
                    </span>
                  ) : (
                    editingJob ? t('hr.job.update') || 'Cập nhật' : t('hr.job.create') || 'Tạo mới'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default JobFormModal