import Joi from 'joi'

// Validation cho đổi mật khẩu
export const changePasswordValidation = Joi.object({
  currentPassword: Joi.string()
    .required()
    .min(6)
    .messages({
      'any.required': 'Vui lòng nhập mật khẩu hiện tại',
      'string.empty': 'Mật khẩu hiện tại không được để trống',
      'string.min': 'Mật khẩu hiện tại phải có ít nhất 6 ký tự'
    }),
  newPassword: Joi.string()
    .required()
    .min(6)
    .max(50)
    .invalid(Joi.ref('currentPassword'))
    .messages({
      'any.required': 'Vui lòng nhập mật khẩu mới',
      'string.empty': 'Mật khẩu mới không được để trống',
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu mới không được vượt quá 50 ký tự',
      'any.invalid': 'Mật khẩu mới phải khác mật khẩu hiện tại'
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('newPassword'))
    .messages({
      'any.required': 'Vui lòng xác nhận mật khẩu mới',
      'string.empty': 'Vui lòng xác nhận mật khẩu mới',
      'any.only': 'Mật khẩu xác nhận không khớp'
    })
})

// Validation cho cập nhật profile
export const updateProfileValidation = Joi.object({
  fullname: Joi.string()
    .required()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
    .messages({
      'any.required': 'Vui lòng nhập họ tên',
      'string.empty': 'Họ tên không được để trống',
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được vượt quá 100 ký tự',
      'string.pattern.base': 'Họ tên chỉ được chứa chữ cái và khoảng trắng'
    }),
  phone: Joi.string()
    .allow(null, '')
    .pattern(/^(0[3-9][0-9]{8,9})$/)
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (phải có 10-11 chữ số, bắt đầu bằng 0)'
    }),
  address: Joi.string()
    .allow(null, '')
    .max(255)
    .messages({
      'string.max': 'Địa chỉ không được vượt quá 255 ký tự'
    })
})

// Validation cho ứng tuyển
export const applyJobValidation = Joi.object({
  job_id: Joi.string()
    .required()
    .uuid()
    .messages({
      'any.required': 'Vui lòng chọn công việc',
      'string.empty': 'ID công việc không được để trống',
      'string.guid': 'ID công việc không hợp lệ'
    }),
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .messages({
      'any.required': 'Vui lòng nhập họ tên',
      'string.empty': 'Họ tên không được để trống',
      'string.min': 'Họ tên phải có ít nhất 2 ký tự',
      'string.max': 'Họ tên không được vượt quá 100 ký tự'
    }),
  email: Joi.string()
    .required()
    .email()
    .messages({
      'any.required': 'Vui lòng nhập email',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ'
    }),
  phone: Joi.string()
    .allow(null, '')
    .pattern(/^(0[3-9][0-9]{8,9})$/)
    .messages({
      'string.pattern.base': 'Số điện thoại không hợp lệ (phải có 10-11 chữ số, bắt đầu bằng 0)'
    }),
  address: Joi.string()
    .allow(null, '')
    .max(255),
  cover_letter: Joi.string()
    .allow(null, '')
    .max(2000)
    .messages({
      'string.max': 'Thư giới thiệu không được vượt quá 2000 ký tự'
    })
})

// Validation cho upload avatar
export const uploadAvatarValidation = Joi.object({
  avatar: Joi.any()
    .required()
    .messages({
      'any.required': 'Vui lòng chọn ảnh'
    })
})

// Validation cho lấy chi tiết ứng tuyển
export const getApplicationDetailValidation = Joi.object({
  id: Joi.string()
    .required()
    .uuid()
    .messages({
      'any.required': 'ID ứng tuyển không hợp lệ',
      'string.guid': 'ID ứng tuyển không hợp lệ'
    })
})

// Validation cho lấy danh sách ứng tuyển
export const getApplicationsValidation = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit phải là số',
      'number.min': 'Limit phải lớn hơn 0',
      'number.max': 'Limit không được vượt quá 100'
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page phải là số',
      'number.min': 'Page phải lớn hơn 0'
    }),
  status: Joi.string()
    .valid('pending', 'reviewing', 'shortlisted', 'rejected', 'hired', 'analyzing', 'analyzed', 'interviewed', 'offered')
    .allow(null, '')
    .messages({
      'any.only': 'Trạng thái không hợp lệ'
    })
})

// Validation cho cập nhật trạng thái ứng tuyển
export const updateApplicationStatusValidation = Joi.object({
  status: Joi.string()
    .required()
    .valid('pending', 'reviewing', 'shortlisted', 'rejected', 'hired', 'analyzing', 'analyzed', 'interviewed', 'offered')
    .messages({
      'any.required': 'Vui lòng chọn trạng thái',
      'string.empty': 'Trạng thái không được để trống',
      'any.only': 'Trạng thái không hợp lệ'
    })
})