import Joi from 'joi'

export const matchJDValidation = Joi.object({
  jdId: Joi.string().uuid().required(),
  threshold: Joi.number().min(0).max(100).default(60),
  limit: Joi.number().min(1).max(50).default(10)
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export default {
  matchJDValidation,
  idValidation
}