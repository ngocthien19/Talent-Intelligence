import express from 'express'
import reportController from '~/controllers/hr/report/report.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Gửi báo cáo
router.post('/:id/send-report', reportController.sendReport)

// Kiểm tra đã gửi chưa
router.get('/:id/report-status', reportController.checkSent)

export default router