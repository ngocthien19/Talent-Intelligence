import express from 'express'
import candidateController from '~/controllers/candidate/candidate.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'

const router = express.Router()

// Tất cả routes cần đăng nhập
router.use(authGuard.isAuthorized)

// Ứng tuyển công việc
router.post(
  '/apply',
  CloudinaryProvider.uploadCV,
  candidateController.applyJob
)

// Lấy danh sách ứng tuyển
router.get('/applications', candidateController.getApplications)

// Lấy chi tiết ứng tuyển
router.get('/applications/:id', candidateController.getApplicationDetail)

// Lấy hồ sơ
router.get('/profile', candidateController.getProfile)

// Cập nhật hồ sơ
router.put('/profile', candidateController.updateProfile)

// Upload avatar
router.post(
  '/avatar',
  CloudinaryProvider.uploadAvatar,
  candidateController.uploadAvatar
)

export default router