import express from 'express'
import rediscoveryController from '~/controllers/hr/rediscovery/rediscovery.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import { matchJDValidation, idValidation } from '~/validations/hr/rediscovery/rediscovery.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Chạy rediscovery (đồng bộ)
router.post(
  '/match',
  validate(matchJDValidation, 'body'),
  rediscoveryController.matchCandidates
)

// Chạy rediscovery (bất đồng bộ)
router.post(
  '/match/async',
  validate(matchJDValidation, 'body'),
  rediscoveryController.matchCandidatesAsync
)

// Lấy kết quả rediscovery
router.get(
  '/results/:jdId',
  validate(idValidation, 'params'),
  rediscoveryController.getResults
)

// Gửi thông báo cho ứng viên
router.post(
  '/notify/:jdId',
  validate(idValidation, 'params'),
  rediscoveryController.notifyCandidates
)

export default router