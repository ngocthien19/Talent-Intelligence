import Joi from 'joi'

export const createSessionValidation = Joi.object({
  // Không cần field nào, chỉ cần body rỗng là được
}).optional()

export const sendMessageValidation = Joi.object({
  sessionId: Joi.string().uuid().required().messages({
    'any.required': 'Vui lòng cung cấp ID phiên phỏng vấn',
    'string.empty': 'ID phiên phỏng vấn không được để trống',
    'string.guid': 'ID phiên phỏng vấn không hợp lệ'
  }),
  message: Joi.string().min(1).max(10000).required().messages({
    'any.required': 'Vui lòng nhập tin nhắn',
    'string.empty': 'Tin nhắn không được để trống',
    'string.min': 'Tin nhắn phải có ít nhất 1 ký tự',
    'string.max': 'Tin nhắn không được vượt quá 10000 ký tự'
  })
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required().messages({
    'any.required': 'ID không hợp lệ',
    'string.guid': 'ID không hợp lệ'
  })
})

export default {
  createSessionValidation,
  sendMessageValidation,
  idValidation
}