import express from 'express'
import favoriteController from '~/controllers/hr/favorite/favorite.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  getCandidatesByJobValidation,
  jobIdParamValidation,
  getTopFavoriteValidation
} from '~/validations/hr/favorite/favorite.validation'

const router = express.Router()

// Tất cả routes đều yêu cầu xác thực và quyền HR
router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Lấy danh sách ứng viên yêu thích công việc
router.get(
  '/jobs/:jobId/favorites/candidates',
  validate(jobIdParamValidation, 'params'),
  validate(getCandidatesByJobValidation, 'query'),
  favoriteController.getCandidatesByJobId
)

// Lấy số lượng ứng viên yêu thích công việc
router.get(
  '/jobs/:jobId/favorites/count',
  validate(jobIdParamValidation, 'params'),
  favoriteController.getFavoriteCount
)

// Lấy danh sách công việc được yêu thích nhiều nhất
router.get(
  '/favorites/top-jobs',
  validate(getTopFavoriteValidation, 'query'),
  favoriteController.getTopFavoriteJobs
)

// Lấy danh sách ứng viên yêu thích nhiều công việc nhất
router.get(
  '/favorites/top-candidates',
  validate(getTopFavoriteValidation, 'query'),
  favoriteController.getTopFavoriteCandidates
)

export default router