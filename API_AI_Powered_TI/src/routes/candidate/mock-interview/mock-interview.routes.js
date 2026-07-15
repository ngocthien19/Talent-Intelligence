import express from 'express'
import mockInterviewController from '~/controllers/candidate/mock-interview/mock-interview.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  startSessionValidation,
  answerQuestionValidation,
  idValidation
} from '~/validations/candidate/mock-interview/mock-interview.validation'

const router = express.Router()

// Tất cả routes cần đăng nhập và là candidate
router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.CANDIDATE))

// Bắt đầu phỏng vấn
router.post(
  '/start',
  validate(startSessionValidation, 'body'),
  mockInterviewController.startSession
)

// Trả lời câu hỏi
router.post(
  '/answer',
  validate(answerQuestionValidation, 'body'),
  mockInterviewController.answerQuestion
)

// Kết thúc phỏng vấn
router.post(
  '/:id/end',
  validate(idValidation, 'params'),
  mockInterviewController.endSession
)

// Lấy lịch sử phỏng vấn
router.get(
  '/history',
  mockInterviewController.getHistory
)

// Lấy chi tiết phiên phỏng vấn
router.get(
  '/:id',
  validate(idValidation, 'params'),
  mockInterviewController.getSessionDetail
)

export default router