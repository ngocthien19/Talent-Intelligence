// src/validations/hr/job-description/job-description.validation.js
import Joi from 'joi'

// Validation cho tạo JD
export const createJDValidation = Joi.object({
  title: Joi.string().required().min(3).max(255),
  description: Joi.string().required().min(10),
  requirements: Joi.string().optional(),
  benefits: Joi.string().optional(),
  requiredSkills: Joi.array().items(Joi.string()).optional(),
  niceToHaveSkills: Joi.array().items(Joi.string()).optional(),
  experienceLevel: Joi.string().valid(
    'Mới tốt nghiệp',
    'Junior (1-3 years)',
    'Mid-Level (3-5 years)',
    'Senior (5-7 years)',
    'Lead (7-10 years)',
    'Manager (10+ years)'
  ).optional(),
  employmentType: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance').optional(),
  location: Joi.string().optional(),
  salaryRange: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string().default('VND')
  }).optional(),
  categoryId: Joi.string().uuid().required(),
  isActive: Joi.boolean().default(true)
})

// Validation cho cập nhật JD
export const updateJDValidation = Joi.object({
  title: Joi.string().min(3).max(255).optional(),
  description: Joi.string().min(10).optional(),
  requirements: Joi.string().optional(),
  benefits: Joi.string().optional(),
  requiredSkills: Joi.array().items(Joi.string()).optional(),
  niceToHaveSkills: Joi.array().items(Joi.string()).optional(),
  experienceLevel: Joi.string().valid(
    'Mới tốt nghiệp',
    'Junior (1-3 years)',
    'Mid-Level (3-5 years)',
    'Senior (5-7 years)',
    'Lead (7-10 years)',
    'Manager (10+ years)'
  ).optional(),
  employmentType: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance').optional(),
  location: Joi.string().optional(),
  salaryRange: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string().default('VND')
  }).optional(),
  categoryId: Joi.string().uuid().required(),
  isActive: Joi.boolean().optional()
})

// Validation cho danh sách JD
export const getJDListValidation = Joi.object({
  keyword: Joi.string().min(1).max(100).optional(),
  experienceLevel: Joi.string().valid(
    'Mới tốt nghiệp',
    'Junior (1-3 years)',
    'Mid-Level (3-5 years)',
    'Senior (5-7 years)',
    'Lead (7-10 years)',
    'Manager (10+ years)'
  ).optional(),
  employmentType: Joi.string().valid('Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance').optional(),
  isActive: Joi.boolean().optional(),
  categoryId: Joi.string().uuid().optional(),
  sortBy: Joi.string().valid('title', 'created_at', 'updated_at').default('created_at'),
  sortOrder: Joi.string().valid('ASC', 'DESC').default('DESC'),
  limit: Joi.number().min(1).max(100).default(20),
  page: Joi.number().min(1).default(1)
})

export const idValidation = Joi.object({
  id: Joi.string().uuid().required()
})

export const bulkActionValidation = Joi.object({
  ids: Joi.array().items(Joi.string().uuid()).min(1).required(),
  action: Joi.string().valid('delete', 'activate', 'deactivate').required()
})

export default {
  createJDValidation,
  updateJDValidation,
  getJDListValidation,
  idValidation,
  bulkActionValidation
}