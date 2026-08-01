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

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

router.get(
  '/favorites/top-jobs',
  validate(getTopFavoriteValidation, 'query'),
  favoriteController.getTopFavoriteJobs
)

router.get(
  '/favorites/top-candidates',
  validate(getTopFavoriteValidation, 'query'),
  favoriteController.getTopFavoriteCandidates
)

router.get(
  '/jobs/:jobId/favorites/candidates',
  validate(jobIdParamValidation, 'params'),
  validate(getCandidatesByJobValidation, 'query'),
  favoriteController.getCandidatesByJobId
)

router.get(
  '/jobs/:jobId/favorites/count',
  validate(jobIdParamValidation, 'params'),
  favoriteController.getFavoriteCount
)

export default router