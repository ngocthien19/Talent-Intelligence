import Joi from 'joi'

export const createScheduleValidation = Joi.object({
  applicationId: Joi.string().uuid().required(),
  interviewDate: Joi.date().iso().required().min('now'),
  duration: Joi.number().min(15).max(180).default(60),
  location: Joi.string().optional().allow(''),
  meetLink: Joi.string().uri().optional().allow(''),
  notes: Joi.string().max(500).optional().allow(''),
  autoCreateCalendar: Joi.boolean().default(true)
})

export const updateScheduleValidation = Joi.object({
  interviewDate: Joi.date().iso().optional(),
  duration: Joi.number().min(15).max(180).optional(),
  location: Joi.string().optional().allow(''),
  meetLink: Joi.string().uri().optional().allow(''),
  notes: Joi.string().max(500).optional().allow('')
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export const candidateIdValidation = Joi.object({
  candidateId: Joi.string().uuid().required()
})

export const updateStatusValidation = Joi.object({
  status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show').required()
})

export const bulkDeleteValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required()
})

export const getListValidation = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  status: Joi.string().valid('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show').optional(),
  keyword: Joi.string().optional().allow(''),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  sortBy: Joi.string().valid('interview_date', 'created_at', 'status').default('interview_date'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('ASC')
})

export default {
  createScheduleValidation,
  updateScheduleValidation,
  idValidation,
  candidateIdValidation,
  updateStatusValidation,
  bulkDeleteValidation,
  getListValidation
}