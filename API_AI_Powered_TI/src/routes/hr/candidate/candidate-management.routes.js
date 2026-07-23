import express from 'express'
import candidateManagementController from '~/controllers/hr/candidate/candidate-management.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  getCandidatesValidation,
  updateStatusValidation,
  updateStatusBulkValidation,
  deleteBulkValidation,
  idValidation
} from '~/validations/hr/candidate/candidate-management.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Danh sách ứng viên
router.get(
  '/candidates',
  validate(getCandidatesValidation, 'query'),
  candidateManagementController.getCandidates
)

// Chi tiết ứng viên
router.get(
  '/candidates/:id',
  validate(idValidation, 'params'),
  candidateManagementController.getCandidateDetail
)

// Cập nhật trạng thái (single)
router.put(
  '/candidates/:id/status',
  validate(idValidation, 'params'),
  validate(updateStatusValidation, 'body'),
  candidateManagementController.updateStatus
)

// Cập nhật trạng thái (bulk)
router.put(
  '/candidates/status/bulk',
  validate(updateStatusBulkValidation, 'body'),
  candidateManagementController.updateStatusBulk
)

// Xóa ứng viên (single)
router.delete(
  '/candidates/:id',
  validate(idValidation, 'params'),
  candidateManagementController.deleteCandidate
)

// Xóa bulk
router.delete(
  '/candidates/bulk',
  validate(deleteBulkValidation, 'body'),
  candidateManagementController.deleteBulk
)

// Widgets
router.get('/widgets', candidateManagementController.getWidgets)

export default router