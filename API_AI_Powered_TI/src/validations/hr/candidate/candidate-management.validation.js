import Joi from 'joi'

export const getCandidatesValidation = Joi.object({
  status: Joi.string().valid('pending', 'analyzing', 'analyzed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected'),
  keyword: Joi.string().min(1).max(100).optional(),
  minScore: Joi.number().min(0).max(100).optional(),
  maxScore: Joi.number().min(0).max(100).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('name', 'email', 'position_applied', 'overall_score', 'status', 'created_at').default('created_at'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  limit: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1)
})

export const updateStatusValidation = Joi.object({
  status: Joi.string().valid('pending', 'analyzing', 'analyzed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected').required()
})

export const updateStatusBulkValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  status: Joi.string().valid('pending', 'analyzing', 'analyzed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected').required()
})

export const deleteBulkValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required()
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export default {
  getCandidatesValidation,
  updateStatusValidation,
  updateStatusBulkValidation,
  deleteBulkValidation,
  idValidation
}