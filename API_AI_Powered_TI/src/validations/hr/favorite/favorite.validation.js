import Joi from 'joi'

// Validation cho params (jobId)
export const jobIdParamValidation = Joi.object({
  jobId: Joi.string().uuid().required().messages({
    'string.base': '"jobId" phải là chuỗi',
    'string.empty': '"jobId" không được để trống',
    'string.guid': '"jobId" phải là UUID hợp lệ',
    'any.required': '"jobId" là bắt buộc'
  })
})

// Validation cho query (lấy danh sách ứng viên)
export const getCandidatesByJobValidation = Joi.object({
  limit: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1),
  keyword: Joi.string().min(1).max(100).optional().allow('')
})

// Validation cho top favorites
export const getTopFavoriteValidation = Joi.object({
  limit: Joi.number().min(1).max(50).default(10)
})

export default {
  getCandidatesByJobValidation,
  jobIdParamValidation,
  getTopFavoriteValidation
}