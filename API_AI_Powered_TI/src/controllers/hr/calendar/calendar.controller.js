import calendarService from '~/services/hr/calendar/calendar.service'

const calendarController = {
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

  getSchedulesByCompany: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const {
        limit = 20,
        page = 1,
        status,
        keyword,
        startDate,
        endDate
      } = req.query

      const offset = (page - 1) * limit

      const result = await calendarService.getSchedulesByCompany({
        companyId,
        limit: parseInt(limit),
        offset: parseInt(offset),
        status,
        keyword,
        startDate,
        endDate
      })

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  getScheduleStats: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const stats = await calendarService.getScheduleStats(companyId)

      return res.status(200).json({
        success: true,
        data: stats
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

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
  },

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

  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params
      const updateData = req.body

      const schedule = await calendarService.updateSchedule(id, updateData)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật lịch thành công',
        data: schedule
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

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

  bulkDeleteSchedules: async (req, res) => {
    try {
      const { ids } = req.body
      const companyId = req.user.companyId

      const result = await calendarService.bulkDeleteSchedules(ids, companyId)

      return res.status(200).json({
        success: true,
        message: `Đã xóa ${result.length} lịch phỏng vấn`,
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

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
  }
}

export default calendarController