import express from 'express'
import resumeEnrichmentController from '~/controllers/hr/resume-enrichment/resume-enrichment.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import { idValidation } from '~/validations/hr/resume-enrichment/resume-enrichment.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Phân tích nâng cao CV
router.post(
  '/:id/enrich',
  validate(idValidation, 'params'),
  resumeEnrichmentController.analyzeResume
)

// Lấy kết quả phân tích
router.get(
  '/:id/enrichment',
  validate(idValidation, 'params'),
  resumeEnrichmentController.getEnrichment
)

// Kiểm tra đã phân tích chưa
router.get(
  '/:id/enrichment/check',
  validate(idValidation, 'params'),
  resumeEnrichmentController.checkEnrichment
)

// Xóa phân tích
router.delete(
  '/:id/enrichment',
  validate(idValidation, 'params'),
  resumeEnrichmentController.deleteEnrichment
)

export default router