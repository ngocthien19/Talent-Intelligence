import express from 'express'
import candidateController from '~/controllers/candidate/candidate.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ensureCandidate } from '~/middlewares/ensureCandidate.middleware'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import validate from '~/middlewares/validate.middleware'
import {
  changePasswordValidation,
  updateProfileValidation,
  applyJobValidation,
  uploadAvatarValidation,
  getApplicationDetailValidation,
  getApplicationsValidation,
  updateApplicationStatusValidation
} from '~/validations/candidate/candidate.validation'

const router = express.Router()

// Tất cả routes cần đăng nhập
router.use(authGuard.isAuthorized)
router.use(ensureCandidate)

// Ứng tuyển công việc
router.post(
  '/apply',
  CloudinaryProvider.uploadCV,
  validate(applyJobValidation, 'body'),
  candidateController.applyJob
)

// Lấy danh sách ứng tuyển
router.get(
  '/applications',
  validate(getApplicationsValidation, 'query'),
  candidateController.getApplications
)

// Lấy chi tiết ứng tuyển
router.get(
  '/applications/:id',
  validate(getApplicationDetailValidation, 'params'),
  candidateController.getApplicationDetail
)

// Lấy số lượng ứng tuyển
router.get('/applications/count', candidateController.getApplicationCount)

// Cập nhật trạng thái ứng tuyển
router.put(
  '/applications/:id/status',
  validate(updateApplicationStatusValidation, 'body'),
  candidateController.updateApplicationStatus
)

// Xóa ứng tuyển
router.delete(
  '/applications/:id',
  validate(getApplicationDetailValidation, 'params'),
  candidateController.deleteApplication
)

// Lấy hồ sơ
router.get('/profile', candidateController.getProfile)

// Cập nhật hồ sơ
router.put(
  '/profile',
  validate(updateProfileValidation, 'body'),
  candidateController.updateProfile
)

// Upload avatar
router.post(
  '/avatar',
  CloudinaryProvider.uploadAvatar,
  candidateController.uploadAvatar
)

// Đổi mật khẩu
router.put(
  '/change-password',
  validate(changePasswordValidation, 'body'),
  candidateController.changePassword
)

export default router