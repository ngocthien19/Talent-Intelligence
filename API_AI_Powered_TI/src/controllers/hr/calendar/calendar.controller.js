import calendarService from '~/services/hr/calendar/calendar.service'

const calendarController = {
  // Tạo lịch phỏng vấn
  createSchedule: async (req, res) => {
    try {
      const {
        applicationId,
        interviewDate,
        duration,
        location,
        meetLink,
        notes,
        autoCreateCalendar
      } = req.body

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp applicationId'
        })
      }

      const schedule = await calendarService.createSchedule({
        applicationId,
        interviewDate,
        duration,
        location,
        meetLink,
        notes,
        autoCreateCalendar: autoCreateCalendar !== false
      })

      return res.status(201).json({
        success: true,
        message: 'Tạo lịch phỏng vấn thành công',
        data: {
          ...schedule,
          hasCalendarEvent: !!schedule.google_event_id
        }
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Tạo Google Calendar Event
  createCalendarEvent: async (req, res) => {
    try {
      const { id } = req.params

      const result = await calendarService.createGoogleCalendarEvent(id)

      return res.status(200).json({
        success: true,
        message: 'Tạo sự kiện Google Calendar thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách lịch theo candidate
  getSchedulesByCandidate: async (req, res) => {
    try {
      const { candidateId } = req.params

      const schedules = await calendarService.getSchedulesByCandidate(candidateId)

      return res.status(200).json({
        success: true,
        data: schedules
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách lịch theo công ty
  getSchedulesByCompany: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const { limit = 20, page = 1 } = req.query
      const offset = (page - 1) * limit

      const schedules = await calendarService.getSchedulesByCompany(
        companyId,
        parseInt(limit),
        parseInt(offset)
      )

      return res.status(200).json({
        success: true,
        data: schedules,
        pagination: {
          limit: parseInt(limit),
          page: parseInt(page),
          offset: parseInt(offset)
        }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy chi tiết lịch
  getScheduleById: async (req, res) => {
    try {
      const { id } = req.params

      const schedule = await calendarService.getScheduleById(id)

      return res.status(200).json({
        success: true,
        data: schedule
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xác nhận lịch (ứng viên)
  confirmSchedule: async (req, res) => {
    try {
      const { id } = req.params

      const schedule = await calendarService.confirmSchedule(id)

      return res.status(200).json({
        success: true,
        message: 'Xác nhận lịch phỏng vấn thành công',
        data: schedule
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Cập nhật trạng thái lịch
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { status } = req.body

      const schedule = await calendarService.updateStatus(id, status)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: schedule
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Hủy lịch
  cancelSchedule: async (req, res) => {
    try {
      const { id } = req.params

      const result = await calendarService.cancelSchedule(id)

      return res.status(200).json({
        success: true,
        message: 'Hủy lịch phỏng vấn thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy lịch sắp tới
  getUpcomingSchedules: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const { limit = 5 } = req.query

      const schedules = await calendarService.getUpcomingSchedules(
        companyId,
        parseInt(limit)
      )

      return res.status(200).json({
        success: true,
        data: schedules
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy lịch hôm nay
  getTodaySchedules: async (req, res) => {
    try {
      const companyId = req.user.companyId

      const schedules = await calendarService.getTodaySchedules(companyId)

      return res.status(200).json({
        success: true,
        data: schedules
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy số lượng lịch
  getScheduleCount: async (req, res) => {
    try {
      const { candidateId } = req.params

      const count = await calendarService.getScheduleCount(candidateId)

      return res.status(200).json({
        success: true,
        data: { count }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default calendarController