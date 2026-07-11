import Joi from 'joi'

export const createScheduleValidation = Joi.object({
  candidateId: Joi.string().uuid().required(),
  interviewDate: Joi.date().iso().required().min('now'),
  duration: Joi.number().min(15).max(180).default(60),
  location: Joi.string().optional(),
  meetLink: Joi.string().uri().optional(),
  notes: Joi.string().max(500).optional(),
  autoCreateCalendar: Joi.boolean().default(true)
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export const candidateIdValidation = Joi.object({
  candidateId: Joi.string().uuid().required()
})

export default {
  createScheduleValidation,
  idValidation,
  candidateIdValidation
}