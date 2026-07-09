import express from 'express'
import comparisonController from '~/controllers/hr/comparison/comparison.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import { compareCandidatesValidation } from '~/validations/hr/comparison/comparison.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// So sánh nhiều ứng viên
router.post(
  '/compare',
  validate(compareCandidatesValidation, 'body'),
  comparisonController.compareCandidates
)

// So sánh 2 ứng viên
router.get('/compare/:id1/:id2', comparisonController.compareTwo)

export default router