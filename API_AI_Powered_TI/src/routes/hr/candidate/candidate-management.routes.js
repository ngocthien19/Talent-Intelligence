import express from 'express'
import candidateManagementController from '~/controllers/hr/candidate/candidate-management.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  getCandidatesValidation,
  updateStatusValidation,
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

// Cập nhật trạng thái
router.put(
  '/candidates/:id/status',
  validate(idValidation, 'params'),
  validate(updateStatusValidation, 'body'),
  candidateManagementController.updateStatus
)

// Xóa ứng viên
router.delete(
  '/candidates/:id',
  validate(idValidation, 'params'),
  candidateManagementController.deleteCandidate
)

// Widgets
router.get('/widgets', candidateManagementController.getWidgets)

export default router