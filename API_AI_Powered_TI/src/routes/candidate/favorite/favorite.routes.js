import express from 'express'
import favoriteController from '~/controllers/candidate/favorite/favorite.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ensureCandidate } from '~/middlewares/ensureCandidate.middleware'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  toggleFavoriteValidation,
  idValidation
} from '~/validations/candidate/favorite/favorite.validation'

const router = express.Router()

// Tất cả routes cần đăng nhập và là candidate
router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.CANDIDATE))
router.use(ensureCandidate)

// Toggle yêu thích (thêm/xóa)
router.post(
  '/favorites/toggle',
  validate(toggleFavoriteValidation, 'body'),
  favoriteController.toggleFavorite
)

// Lấy danh sách yêu thích
router.get('/favorites', favoriteController.getFavorites)

// Kiểm tra đã yêu thích chưa
router.get(
  '/favorites/:jobId/check',
  validate(idValidation, 'params'),
  favoriteController.isFavorite
)

// Lấy số lượng yêu thích của job
router.get(
  '/favorites/:jobId/count',
  validate(idValidation, 'params'),
  favoriteController.getFavoriteCount
)

// Xóa tất cả yêu thích
router.delete('/favorites/clear', favoriteController.clearFavorites)

export default router