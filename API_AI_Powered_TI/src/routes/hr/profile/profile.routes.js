import express from 'express'
import profileController from '~/controllers/hr/profile/profile.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import {
  updateCompanyValidation,
  updateProfileValidation,
  changePasswordValidation
} from '~/validations/hr/profile/profile.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Lấy thông tin công ty
router.get('/company', profileController.getCompany)

// Cập nhật thông tin công ty
router.put(
  '/company',
  validate(updateCompanyValidation, 'body'),
  profileController.updateCompany
)

// Upload logo & banner cho công ty
router.post(
  '/company/upload',
  CloudinaryProvider.uploadCompanyFiles,
  profileController.uploadCompanyFiles
)

// Lấy thông tin HR
router.get('/profile', profileController.getProfile)

// Cập nhật thông tin HR
router.put(
  '/profile',
  validate(updateProfileValidation, 'body'),
  profileController.updateProfile
)

// Upload avatar
router.post(
  '/profile/avatar',
  CloudinaryProvider.uploadAvatar,
  profileController.uploadAvatar
)

// Đổi mật khẩu
router.put(
  '/profile/change-password',
  validate(changePasswordValidation, 'body'),
  profileController.changePassword
)

export default router