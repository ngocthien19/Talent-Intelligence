import { google } from 'googleapis'
import { env } from '~/config/environment'

const auth = new google.auth.GoogleAuth({
  keyFile: env.GOOGLE_SERVICE_ACCOUNT_KEY || './service-account-key.json',
  scopes: ['https://www.googleapis.com/auth/calendar']
})

const calendar = google.calendar({ version: 'v3', auth })

const CALENDAR_ID = env.GOOGLE_CALENDAR_ID || 'primary'

export const getCalendarClient = () => {
  return calendar
}

export const getAuthClient = () => {
  return auth
}

export const createCalendarEvent = async (eventData) => {
  try {
    const {
      summary,
      description,
      startDateTime,
      endDateTime,
      location,
      reminders,
      timeZone = 'Asia/Ho_Chi_Minh',
      meetLink
    } = eventData

    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone
      },
      location: location || (meetLink ? `Google Meet: ${meetLink}` : 'Online Meeting'),
      reminders: reminders || {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    }

    if (meetLink) {
      event.description = `${description || ''}\n\n Link tham gia: ${meetLink}`
    }

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
      sendUpdates: 'none'
    })

    const meetLinkResult = meetLink || response.data.htmlLink

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      meetLink: meetLinkResult,
      event: response.data
    }
  } catch (error) {
    throw new Error(`Tạo sự kiện thất bại: ${error.message}`)
  }
}

export const getCalendarEvent = async (eventId) => {
  try {
    const response = await calendar.events.get({
      calendarId: CALENDAR_ID,
      eventId: eventId
    })
    return response.data
  } catch (error) {
    console.error('Error getting calendar event:', error.message)
    return null
  }
}

export const deleteCalendarEvent = async (eventId) => {
  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      sendUpdates: 'none'
    })
    return { success: true, message: 'Xóa sự kiện thành công' }
  } catch (error) {
    throw new Error(`Xóa sự kiện thất bại: ${error.message}`)
  }
}

export const updateCalendarEvent = async (eventId, eventData) => {
  try {
    const {
      summary,
      description,
      startDateTime,
      endDateTime,
      location,
      timeZone = 'Asia/Ho_Chi_Minh'
    } = eventData

    const event = {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone
      },
      end: {
        dateTime: endDateTime,
        timeZone
      },
      location: location || 'Online Meeting'
    }

    const response = await calendar.events.update({
      calendarId: CALENDAR_ID,
      eventId: eventId,
      resource: event,
      sendUpdates: 'none'
    })

    return {
      success: true,
      eventId: response.data.id,
      htmlLink: response.data.htmlLink,
      event: response.data
    }
  } catch (error) {
    throw new Error(`Cập nhật sự kiện thất bại: ${error.message}`)
  }
}

export default {
  getCalendarClient,
  getAuthClient,
  createCalendarEvent,
  getCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
}