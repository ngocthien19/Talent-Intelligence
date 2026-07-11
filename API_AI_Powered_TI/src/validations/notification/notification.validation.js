import Joi from 'joi'

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export const getNotificationsValidation = Joi.object({
  limit: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1)
})

export default {
  idValidation,
  getNotificationsValidation
}