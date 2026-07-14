import Joi from 'joi'

// Validation so sánh ứng viên
export const compareCandidatesValidation = Joi.object({
  candidateIds: Joi.array().items(Joi.string().uuid()).min(2).max(5).required()
})

export default {
  compareCandidatesValidation
}