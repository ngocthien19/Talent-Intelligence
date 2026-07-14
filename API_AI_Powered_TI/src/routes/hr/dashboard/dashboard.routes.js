import express from 'express'
import dashboardController from '~/controllers/hr/dashboard/dashboard.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Dashboard
router.get('/', dashboardController.getDashboard)

export default router