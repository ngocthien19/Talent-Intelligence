import Joi from 'joi'

export const createCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  description: Joi.string().max(500).optional(),
  isActive: Joi.boolean().default(true)
})

export const updateCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().max(500).optional(),
  isActive: Joi.boolean().optional()
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export const getCategoriesValidation = Joi.object({
  isActive: Joi.boolean().optional(),
  keyword: Joi.string().min(1).max(100).optional(),
  limit: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1)
})

export default {
  createCategoryValidation,
  updateCategoryValidation,
  idValidation,
  getCategoriesValidation
}