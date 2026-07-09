import express from 'express'
import analysisController from '~/controllers/hr/analysis/analysis.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Phân tích CV
router.post('/:id/analyze', analysisController.analyzeCandidate)

// Lấy kết quả phân tích
router.get('/:id/analysis', analysisController.getAnalysisResult)

export default router