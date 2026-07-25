import Joi from 'joi'

export const createCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.empty': 'Tên danh mục không được để trống',
    'string.min': 'Tên danh mục phải có ít nhất 2 ký tự',
    'string.max': 'Tên danh mục không được vượt quá 100 ký tự',
    'any.required': 'Tên danh mục là bắt buộc'
  }),
  description: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Mô tả không được vượt quá 500 ký tự'
  }),
  isActive: Joi.boolean().default(true)
})

export const updateCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'Tên danh mục phải có ít nhất 2 ký tự',
    'string.max': 'Tên danh mục không được vượt quá 100 ký tự'
  }),
  description: Joi.string().max(500).optional().allow('', null).messages({
    'string.max': 'Mô tả không được vượt quá 500 ký tự'
  }),
  isActive: Joi.boolean().optional()
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'ID không hợp lệ',
    'any.required': 'ID là bắt buộc'
  })
})

export const getCategoriesValidation = Joi.object({
  isActive: Joi.string().valid('true', 'false', '').optional().allow(''),
  keyword: Joi.string().min(1).max(100).optional().allow(''),
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'Ngày bắt đầu không hợp lệ'
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': 'Ngày kết thúc không hợp lệ'
  }),
  sortBy: Joi.string().valid('name', 'is_active', 'created_at', 'updated_at').default('created_at'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  limit: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1)
})

// Bulk update status validation
export const updateStatusBulkValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'Vui lòng chọn ít nhất 1 danh mục',
    'any.required': 'Danh sách ID là bắt buộc'
  }),
  isActive: Joi.boolean().required().messages({
    'any.required': 'Trạng thái là bắt buộc'
  })
})

// Bulk delete validation
export const deleteBulkValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required().messages({
    'array.min': 'Vui lòng chọn ít nhất 1 danh mục',
    'any.required': 'Danh sách ID là bắt buộc'
  })
})

// Update status single validation
export const updateStatusValidation = Joi.object({
  isActive: Joi.boolean().required().messages({
    'any.required': 'Trạng thái là bắt buộc'
  })
})

export default {
  createCategoryValidation,
  updateCategoryValidation,
  idValidation,
  getCategoriesValidation,
  updateStatusBulkValidation,
  deleteBulkValidation,
  updateStatusValidation
}