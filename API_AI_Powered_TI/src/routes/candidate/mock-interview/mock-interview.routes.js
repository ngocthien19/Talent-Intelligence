import express from 'express'
import mockInterviewController from '~/controllers/candidate/mock-interview/mock-interview.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  createSessionValidation,
  sendMessageValidation,
  idValidation
} from '~/validations/candidate/mock-interview/mock-interview.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.CANDIDATE))

// Tạo phiên mới
router.post(
  '/session',
  validate(createSessionValidation, 'body'),
  mockInterviewController.createSession
)

// Gửi tin nhắn (chat)
router.post(
  '/chat',
  validate(sendMessageValidation, 'body'),
  mockInterviewController.sendMessage
)

// Lấy lịch sử chat
router.get(
  '/:id/history',
  validate(idValidation, 'params'),
  mockInterviewController.getChatHistory
)

// Lấy danh sách phiên
router.get(
  '/sessions',
  mockInterviewController.getSessions
)

// Xóa phiên
router.delete(
  '/:id',
  validate(idValidation, 'params'),
  mockInterviewController.deleteSession
)

export default router