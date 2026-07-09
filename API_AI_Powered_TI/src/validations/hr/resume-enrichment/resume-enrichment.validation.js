import Joi from 'joi'

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export default {
  idValidation
}