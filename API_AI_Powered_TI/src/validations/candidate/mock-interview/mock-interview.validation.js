import Joi from 'joi'

export const startSessionValidation = Joi.object({
  candidateId: Joi.string().uuid().required(),
  jobId: Joi.string().uuid().optional(),
  numberOfQuestions: Joi.number().min(3).max(10).default(5)
})

export const answerQuestionValidation = Joi.object({
  sessionId: Joi.string().uuid().required(),
  questionId: Joi.string().uuid().required(),
  answer: Joi.string().min(1).max(5000).required()
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export default {
  startSessionValidation,
  answerQuestionValidation,
  idValidation
}