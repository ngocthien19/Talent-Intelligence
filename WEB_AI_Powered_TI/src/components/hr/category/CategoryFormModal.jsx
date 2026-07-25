import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { FaTimes } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const CategoryFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingCategory,
  isSubmitting = false
}) => {
  const { t } = useLanguage()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    clearErrors
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      isActive: true
    }
  })

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        reset({
          name: editingCategory.name || '',
          description: editingCategory.description || '',
          isActive: editingCategory.is_active !== undefined ? editingCategory.is_active : true
        })
      } else {
        reset({
          name: '',
          description: '',
          isActive: true
        })
      }
      clearErrors()
    }
  }, [isOpen, editingCategory, reset, clearErrors])

  const onFormSubmit = (data) => {
    onSubmit(data)
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-light/50 dark:border-gray-700">
              <h2 className="text-xl font-bold text-brand-secondary dark:text-white">
                {editingCategory
                  ? t('hr.category.editTitle') || 'Chỉnh sửa danh mục'
                  : t('hr.category.addTitle') || 'Thêm danh mục mới'
                }
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-brand-light/30 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
              >
                <FaTimes size={18} className="text-brand-text/60 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.category.name') || 'Tên danh mục'} <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', {
                    required: t('hr.category.validation.nameRequired') || 'Vui lòng nhập tên danh mục',
                    minLength: { value: 2, message: t('hr.category.validation.nameMin') || 'Tên danh mục phải có ít nhất 2 ký tự' },
                    maxLength: { value: 100, message: t('hr.category.validation.nameMax') || 'Tên danh mục không được vượt quá 100 ký tự' }
                  })}
                  type="text"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                    errors.name ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                  }`}
                  placeholder={t('hr.category.namePlaceholder') || 'Nhập tên danh mục...'}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-brand-secondary dark:text-white block mb-1.5">
                  {t('hr.category.description') || 'Mô tả'}
                </label>
                <textarea
                  {...register('description', {
                    maxLength: { value: 500, message: t('hr.category.validation.descriptionMax') || 'Mô tả không được vượt quá 500 ký tự' }
                  })}
                  rows={4}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white dark:bg-gray-900 text-brand-secondary dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all duration-200 ${
                    errors.description ? 'border-red-500' : 'border-brand-light/50 dark:border-gray-700'
                  }`}
                  placeholder={t('hr.category.descriptionPlaceholder') || 'Nhập mô tả danh mục...'}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              {/* Active status */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  {...register('isActive')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-brand-light/50 dark:border-gray-700 text-brand-primary focus:ring-brand-primary/50 transition-all cursor-pointer"
                />
                <label className="text-sm font-medium text-brand-secondary dark:text-white">
                  {t('hr.category.active') || 'Đang hoạt động'}
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-brand-light/50 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-brand-text/60 dark:text-gray-400 hover:text-brand-secondary dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  {t('common.cancel') || 'Hủy'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 shadow-sm transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    editingCategory
                      ? t('hr.category.update') || 'Cập nhật'
                      : t('hr.category.create') || 'Tạo mới'
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

export default CategoryFormModal