import express from 'express'
import jobDescriptionController from '~/controllers/hr/job-description/job-description.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  createJDValidation,
  updateJDValidation,
  getJDListValidation,
  idValidation,
  bulkActionValidation
} from '~/validations/hr/job-description/job-description.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Danh sách JD
router.get(
  '/jobs',
  validate(getJDListValidation, 'query'),
  jobDescriptionController.getList
)

// Chi tiết JD
router.get(
  '/jobs/:id',
  validate(idValidation, 'params'),
  jobDescriptionController.getById
)

// Tạo JD mới
router.post(
  '/jobs',
  validate(createJDValidation, 'body'),
  jobDescriptionController.create
)

// Cập nhật JD
router.put(
  '/jobs/:id',
  validate(idValidation, 'params'),
  validate(updateJDValidation, 'body'),
  jobDescriptionController.update
)

// Xóa JD
router.delete(
  '/jobs/:id',
  validate(idValidation, 'params'),
  jobDescriptionController.delete
)

router.post(
  '/jobs/bulk',
  validate(bulkActionValidation, 'body'),
  jobDescriptionController.bulkAction
)

export default router