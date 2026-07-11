import express from 'express'
import hrNotificationController from '~/controllers/hr/notification/notification.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  idValidation,
  getNotificationsValidation
} from '~/validations/notification/notification.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Lấy danh sách thông báo
router.get(
  '/notifications',
  validate(getNotificationsValidation, 'query'),
  hrNotificationController.getNotifications
)

// Lấy thông báo chưa đọc
router.get('/notifications/unread', hrNotificationController.getUnread)

// Đếm thông báo chưa đọc
router.get('/notifications/count', hrNotificationController.countUnread)

// Đánh dấu đã đọc
router.put(
  '/notifications/:id/read',
  validate(idValidation, 'params'),
  hrNotificationController.markAsRead
)

// Đánh dấu tất cả đã đọc
router.put('/notifications/read-all', hrNotificationController.markAllAsRead)

// Xóa thông báo
router.delete(
  '/notifications/:id',
  validate(idValidation, 'params'),
  hrNotificationController.delete
)

// Xóa tất cả thông báo
router.delete('/notifications/all', hrNotificationController.deleteAll)

export default router