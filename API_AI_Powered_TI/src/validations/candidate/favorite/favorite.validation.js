import Joi from 'joi'

export const toggleFavoriteValidation = Joi.object({
  jobId: Joi.string().uuid().required()
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export default {
  toggleFavoriteValidation,
  idValidation
}