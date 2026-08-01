import Joi from 'joi'

export const getCandidatesByJobValidation = Joi.object({
  jobId: Joi.string().uuid().required(),
  limit: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1),
  keyword: Joi.string().min(1).max(100).optional()
})

export const jobIdParamValidation = Joi.object({
  jobId: Joi.string().uuid().required()
})

export const getTopFavoriteValidation = Joi.object({
  limit: Joi.number().min(1).max(50).default(10)
})

export default {
  getCandidatesByJobValidation,
  jobIdParamValidation,
  getTopFavoriteValidation
}