import Joi from 'joi'

// Validation cập nhật company
export const updateCompanyValidation = Joi.object({
  name: Joi.string().min(2).max(255).optional(),
  description: Joi.string().optional(),
  cultureDescription: Joi.string().optional(),
  industry: Joi.string().optional(),
  website: Joi.string().uri().optional(),
  address: Joi.string().optional(),
  size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+').optional(),
  isActive: Joi.boolean().optional()
})

// Validation cập nhật HR profile
export const updateProfileValidation = Joi.object({
  fullname: Joi.string().min(2).max(255).optional(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional(),
  address: Joi.string().optional()
})

// Validation đổi mật khẩu
export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
})

export default {
  updateCompanyValidation,
  updateProfileValidation,
  changePasswordValidation
}