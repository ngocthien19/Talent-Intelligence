import express from 'express'
import calendarController from '~/controllers/hr/calendar/calendar.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  createScheduleValidation,
  idValidation,
  candidateIdValidation
} from '~/validations/hr/calendar/calendar.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Tạo lịch phỏng vấn
router.post(
  '/schedules',
  validate(createScheduleValidation, 'body'),
  calendarController.createSchedule
)

// Tạo Google Calendar Event
router.post(
  '/schedules/:id/calendar',
  validate(idValidation, 'params'),
  calendarController.createCalendarEvent
)

// Lấy danh sách lịch theo candidate
router.get(
  '/schedules/candidate/:candidateId',
  validate(candidateIdValidation, 'params'),
  calendarController.getSchedulesByCandidate
)

// Lấy danh sách lịch theo công ty
router.get('/schedules', calendarController.getSchedulesByCompany)

// Lấy chi tiết lịch
router.get(
  '/schedules/:id/detail',
  validate(idValidation, 'params'),
  calendarController.getScheduleById
)

// Xác nhận lịch (ứng viên)
router.put(
  '/schedules/:id/confirm',
  validate(idValidation, 'params'),
  calendarController.confirmSchedule
)

// Cập nhật trạng thái lịch
router.put(
  '/schedules/:id/status',
  validate(idValidation, 'params'),
  calendarController.updateStatus
)

// Hủy lịch
router.delete(
  '/schedules/:id',
  validate(idValidation, 'params'),
  calendarController.cancelSchedule
)

// Lấy lịch sắp tới
router.get('/schedules/upcoming', calendarController.getUpcomingSchedules)

// Lấy lịch hôm nay
router.get('/schedules/today', calendarController.getTodaySchedules)

// Lấy số lượng lịch
router.get(
  '/schedules/count/:candidateId',
  validate(candidateIdValidation, 'params'),
  calendarController.getScheduleCount
)

export default router