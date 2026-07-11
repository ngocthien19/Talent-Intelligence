import express from 'express'
import candidateNotificationController from '~/controllers/candidate/notification/notification.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  idValidation,
  getNotificationsValidation
} from '~/validations/notification/notification.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.CANDIDATE))

// Lấy danh sách thông báo
router.get(
  '/notifications',
  validate(getNotificationsValidation, 'query'),
  candidateNotificationController.getNotifications
)

// Lấy thông báo chưa đọc
router.get('/notifications/unread', candidateNotificationController.getUnread)

// Đếm thông báo chưa đọc
router.get('/notifications/count', candidateNotificationController.countUnread)

// Đánh dấu đã đọc
router.put(
  '/notifications/:id/read',
  validate(idValidation, 'params'),
  candidateNotificationController.markAsRead
)

// Đánh dấu tất cả đã đọc
router.put('/notifications/read-all', candidateNotificationController.markAllAsRead)

// Xóa thông báo
router.delete(
  '/notifications/:id',
  validate(idValidation, 'params'),
  candidateNotificationController.delete
)

// Xóa tất cả thông báo
router.delete('/notifications/all', candidateNotificationController.deleteAll)

export default router