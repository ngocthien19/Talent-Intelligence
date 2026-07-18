import Joi from 'joi'

export const startSessionValidation = Joi.object({
  jobId: Joi.string().uuid().optional().allow(null, '').messages({
    'string.guid': 'ID công việc không hợp lệ'
  }),
  numberOfQuestions: Joi.number().min(3).max(10).default(5).messages({
    'number.base': 'Số lượng câu hỏi phải là số',
    'number.min': 'Số lượng câu hỏi tối thiểu là 3',
    'number.max': 'Số lượng câu hỏi tối đa là 10'
  })
})

export const answerQuestionValidation = Joi.object({
  sessionId: Joi.string().uuid().required().messages({
    'any.required': 'Vui lòng cung cấp ID phiên phỏng vấn',
    'string.empty': 'ID phiên phỏng vấn không được để trống',
    'string.guid': 'ID phiên phỏng vấn không hợp lệ'
  }),
  questionId: Joi.string().uuid().required().messages({
    'any.required': 'Vui lòng cung cấp ID câu hỏi',
    'string.empty': 'ID câu hỏi không được để trống',
    'string.guid': 'ID câu hỏi không hợp lệ'
  }),
  answer: Joi.string().min(1).max(5000).required().messages({
    'any.required': 'Vui lòng nhập câu trả lời',
    'string.empty': 'Câu trả lời không được để trống',
    'string.min': 'Câu trả lời phải có ít nhất 1 ký tự',
    'string.max': 'Câu trả lời không được vượt quá 5000 ký tự'
  })
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required().messages({
    'any.required': 'ID không hợp lệ',
    'string.guid': 'ID không hợp lệ'
  })
})

export default {
  startSessionValidation,
  answerQuestionValidation,
  idValidation
}