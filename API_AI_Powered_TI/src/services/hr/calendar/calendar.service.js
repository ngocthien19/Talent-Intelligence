import calendarModel from '~/models/hr/calendar/calendar.model'
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvent
} from '~/providers/google-calendar.provider'
import applicationModel from '~/models/candidate/application.model'
import candidateProfileModel from '~/models/candidate/candidate-profile.model'
import { EmailProvider } from '~/providers/email.provider'
import notificationService from '~/services/notification/notification.service'

function generateMeetLink() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const segments = []
  for (let i = 0; i < 3; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars[Math.floor(Math.random() * chars.length)]
    }
    segments.push(segment)
  }
  return `https://meet.google.com/${segments.join('-')}`
}

async function getCandidateInfo(schedule) {
  const application = await applicationModel.findByIdAdmin(schedule.candidate_id)
  if (!application) {
    throw new Error('Không tìm thấy đơn ứng tuyển')
  }

  const profile = await candidateProfileModel.findById(application.candidate_profile_id)
  if (!profile) {
    throw new Error('Không tìm thấy hồ sơ ứng viên')
  }

  return {
    ...application,
    ...profile,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    position_applied: application.position,
    user_id: profile.user_id
  }
}

const calendarService = {
  createSchedule: async (data) => {
    const {
      applicationId,
      interviewDate,
      duration,
      interviewType = 'online',
      location,
      meetLink,
      notes,
      autoCreateCalendar = true
    } = data

    const application = await applicationModel.findByIdAdmin(applicationId)
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển')
    }

    const profile = await candidateProfileModel.findById(application.candidate_profile_id)
    if (!profile) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    const candidate = {
      ...application,
      ...profile,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      position_applied: application.position
    }

    const isOnline = interviewType !== 'offline'

    const finalMeetLink = isOnline ? (meetLink || generateMeetLink()) : null
    const finalLocation = isOnline ? (location || 'Google Meet') : location

    const schedule = await calendarModel.createSchedule({
      candidateId: applicationId,
      interviewDate,
      duration,
      location: finalLocation,
      meetingLink: finalMeetLink,
      notes
    })

    // Tạo sự kiện Google Calendar. KHÔNG nuốt lỗi im lặng nữa -> log ra + trả về
    // calendarWarning để frontend biết và thông báo cho HR (thay vì tưởng là đã thành công).
    let calendarWarning = null
    if (autoCreateCalendar && isOnline) {
      try {
        await calendarService.createGoogleCalendarEvent(schedule.id)
      } catch (error) {
        console.error('Failed to create Google Calendar event:', error.message)
        calendarWarning = `Đã tạo lịch phỏng vấn nhưng không đồng bộ được Google Calendar: ${error.message}`
      }
    }

    // Lấy lại schedule mới nhất (đã có google_event_id / meeting_link cập nhật nếu tạo Calendar thành công)
    const finalSchedule = await calendarModel.getScheduleById(schedule.id)

    await sendInterviewConfirmation(candidate, finalSchedule, finalSchedule.meeting_link)

    await notificationService.sendToCandidate(profile.user_id, {
      type: 'interview_invite',
      title: `Lịch phỏng vấn - ${candidate.position_applied}`,
      content: `Bạn có lịch phỏng vấn vào lúc ${new Date(interviewDate).toLocaleString('vi-VN')}`,
      extraData: {
        scheduleId: finalSchedule.id,
        interviewDate: interviewDate,
        duration: duration || 60,
        location: finalLocation,
        meetingLink: finalSchedule.meeting_link,
        positionApplied: candidate.position_applied,
        status: finalSchedule.status
      }
    })

    return { ...finalSchedule, calendarWarning }
  },

  getSchedulesByCompany: async (filters) => {
    return await calendarModel.getSchedulesByCompany(filters)
  },

  getScheduleStats: async (companyId) => {
    return await calendarModel.getScheduleStats(companyId)
  },

  getSchedulesByCandidate: async (candidateId) => {
    return await calendarModel.getSchedulesByCandidate(candidateId)
  },

  getScheduleById: async (id) => {
    const schedule = await calendarModel.getScheduleById(id)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }
    return schedule
  },

  getUpcomingSchedules: async (companyId, limit = 5) => {
    return await calendarModel.getUpcomingSchedules(companyId, limit)
  },

  getTodaySchedules: async (companyId) => {
    return await calendarModel.getTodaySchedules(companyId)
  },

  getScheduleCount: async (candidateId) => {
    return await calendarModel.getScheduleCount(candidateId)
  },

  confirmSchedule: async (id) => {
    const schedule = await calendarModel.confirmSchedule(id)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }
    return schedule
  },

  getCalendarLink: async (id) => {
    const schedule = await calendarModel.getCalendarLink(id)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }

    if (schedule.google_event_id) {
      try {
        const event = await getCalendarEvent(schedule.google_event_id)
        if (event) {
          return {
            calendarLink: event.htmlLink,
            meetingLink: schedule.meeting_link,
            eventId: schedule.google_event_id,
            hasCalendarEvent: true
          }
        }
      } catch (error) {
        console.error('Error fetching calendar event:', error.message)
      }
    }

    return {
      calendarLink: null,
      meetingLink: schedule.meeting_link,
      eventId: schedule.google_event_id,
      hasCalendarEvent: false
    }
  },

  updateStatus: async (id, status) => {
    const validStatus = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']
    if (!validStatus.includes(status)) {
      throw new Error('Trạng thái không hợp lệ')
    }
    const schedule = await calendarModel.updateScheduleStatus(id, status)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }
    return schedule
  },

  updateSchedule: async (id, updateData) => {
    const schedule = await calendarModel.getScheduleById(id)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }

    const interviewType = updateData.interviewType
    const isOnline = interviewType ? interviewType !== 'offline' : !!schedule.meeting_link

    const dbUpdate = {
      interview_date: updateData.interviewDate,
      duration: updateData.duration,
      location: updateData.location,
      // Nếu người dùng chuyển sang offline khi sửa -> xoá meeting_link cũ đi
      meeting_link: interviewType
        ? (isOnline ? (updateData.meetLink || schedule.meeting_link) : null)
        : updateData.meetLink,
      notes: updateData.notes
    }

    const updated = await calendarModel.updateSchedule(id, dbUpdate)

    // Đồng bộ lại sự kiện Google Calendar đã tồn tại (đổi giờ/địa điểm/ghi chú) - không chặn luồng chính nếu lỗi
    if (updated.google_event_id) {
      try {
        const startDateTime = updated.interview_date
        const endDateTime = new Date(new Date(startDateTime).getTime() + updated.duration * 60000).toISOString()

        await updateCalendarEvent(updated.google_event_id, {
          summary: `Phỏng vấn - ${updated.position_applied}`,
          description: `Ghi chú: ${updated.notes || 'Không có ghi chú'}`,
          startDateTime,
          endDateTime,
          location: updated.meeting_link ? `Google Meet: ${updated.meeting_link}` : (updated.location || 'Online Meeting')
        })
      } catch (error) {
        console.error('Failed to sync Google Calendar event on update:', error.message)
      }
    }

    // Gửi email thông báo lịch đã được cập nhật cho ứng viên - không chặn luồng chính nếu lỗi
    try {
      const candidate = await getCandidateInfo(updated)
      await sendInterviewUpdateEmail(candidate, updated, updated.meeting_link)
    } catch (error) {
      console.error('Failed to send update email:', error.message)
    }

    return updated
  },

  cancelSchedule: async (id) => {
    const schedule = await calendarModel.getScheduleById(id)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }

    if (schedule.google_event_id) {
      try {
        await deleteCalendarEvent(schedule.google_event_id)
      } catch (error) {
        console.error('Failed to delete Google Calendar event:', error.message)
      }
    }

    const result = await calendarModel.updateScheduleStatus(id, 'cancelled')

    // Gửi email thông báo hủy lịch cho ứng viên - không chặn luồng chính nếu lỗi
    try {
      const candidate = await getCandidateInfo(result)
      await sendInterviewCancellationEmail(candidate, result)
    } catch (error) {
      console.error('Failed to send cancellation email:', error.message)
    }

    return result
  },

  bulkDeleteSchedules: async (ids, companyId) => {
    const deleted = []
    for (const id of ids) {
      try {
        const schedule = await calendarModel.getScheduleById(id)
        if (schedule && schedule.company_id === companyId) {
          if (schedule.google_event_id) {
            try {
              await deleteCalendarEvent(schedule.google_event_id)
            } catch (error) {
              console.error('Failed to delete Google Calendar event:', error.message)
            }
          }
          const result = await calendarModel.deleteSchedule(id)
          deleted.push(result)
        }
      } catch (error) {
        console.error(`Failed to delete schedule ${id}:`, error.message)
      }
    }
    return deleted
  },

  createGoogleCalendarEvent: async (scheduleId) => {
    const schedule = await calendarModel.getScheduleById(scheduleId)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }

    const isOnline = !!schedule.meeting_link
    if (!isOnline) {
      throw new Error('Lịch phỏng vấn trực tiếp không hỗ trợ tạo Google Meet')
    }

    const candidate = await getCandidateInfo(schedule)

    const meetLink = schedule.meeting_link || generateMeetLink()

    const startDateTime = schedule.interview_date
    const endDateTime = new Date(new Date(startDateTime).getTime() + schedule.duration * 60000).toISOString()

    const result = await createCalendarEvent({
      summary: `Phỏng vấn - ${candidate.position_applied}`,
      description: `
Phỏng vấn vị trí: ${candidate.position_applied}
Ứng viên: ${candidate.name}
Email: ${candidate.email}
Điện thoại: ${candidate.phone || 'Không có'}

Link tham gia: ${meetLink}

Ghi chú: ${schedule.notes || 'Không có ghi chú'}
      `.trim(),
      startDateTime,
      endDateTime,
      location: `Google Meet: ${meetLink}`,
      attendees: [{ email: candidate.email }],
      timeZone: 'Asia/Ho_Chi_Minh',
      meetLink: meetLink
    })

    await calendarModel.updateGoogleEventId(scheduleId, result.eventId)
    await calendarModel.updateMeetingLink(scheduleId, meetLink)

    return {
      success: true,
      event: result.event,
      meetingLink: meetLink,
      eventId: result.eventId
    }
  }
}

const emailBaseStyles = `
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background: #f5f7fa;
    }
    .container { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .greeting strong { color: #4a6cf7; }
    .info { background: #f8f9fc; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4a6cf7; }
    .info-item { display: flex; align-items: flex-start; margin: 8px 0; }
    .info-item .label { font-weight: 600; min-width: 100px; color: #555; }
    .info-item .value { color: #1a1a2e; }
    .info-item .value a { color: #4a6cf7; text-decoration: none; }
    .meet-link-box { background: #f0f4ff; padding: 12px 16px; border-radius: 8px; margin: 10px 0; word-break: break-all; border: 1px dashed #4a6cf7; }
    .meet-link-box a { color: #4a6cf7; text-decoration: none; font-weight: 500; }
    .button-container { text-align: center; margin: 30px 0 20px; }
    .button { display: inline-block; background: #4a6cf7; color: #ffffff !important; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(74, 108, 247, 0.3); }
    .note { font-size: 14px; color: #888; margin-top: 10px; padding: 12px; background: #f8f9fc; border-radius: 8px; }
    .footer { text-align: center; color: #aaa; font-size: 12px; padding: 20px; border-top: 1px solid #e8ecf1; }
    .footer strong { color: #666; }
`

function formatScheduleDate(date) {
  return new Date(date).toLocaleString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Gửi email xác nhận phỏng vấn (khi tạo mới)
async function sendInterviewConfirmation(candidate, schedule, meetingLink) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${emailBaseStyles}
    .header { background: linear-gradient(135deg, #4a6cf7 0%, #6a3de8 100%); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lịch phỏng vấn</h1>
      <p>${candidate.position_applied}</p>
    </div>
    <div class="content">
      <p class="greeting">Chào <strong>${candidate.name}</strong>,</p>
      <p>Bạn đã được sắp xếp lịch phỏng vấn cho vị trí <strong>${candidate.position_applied}</strong>.</p>
      <div class="info">
        <div class="info-item"><span class="label">Thời gian:</span><span class="value">${formatScheduleDate(schedule.interview_date)}</span></div>
        <div class="info-item"><span class="label">Thời lượng:</span><span class="value">${schedule.duration} phút</span></div>
        <div class="info-item"><span class="label">Địa điểm:</span><span class="value">${schedule.location || 'Online Meeting'}</span></div>
        ${schedule.notes ? `<div class="info-item"><span class="label">Ghi chú:</span><span class="value">${schedule.notes}</span></div>` : ''}
      </div>
      ${meetingLink ? `
      <div style="margin: 20px 0;">
        <p style="font-weight: 600; margin-bottom: 8px;">Link tham gia phỏng vấn:</p>
        <div class="meet-link-box"><a href="${meetingLink}" target="_blank">${meetingLink}</a></div>
      </div>
      <div class="button-container"><a href="${meetingLink}" class="button" target="_blank">Tham gia phỏng vấn</a></div>
      ` : ''}
      <div class="note"><strong>Lưu ý:</strong> Vui lòng tham gia đúng giờ. Nếu có bất kỳ thay đổi, hãy liên hệ với chúng tôi.</div>
      <p style="margin-top: 20px; color: #555;">Chúc bạn may mắn!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} <strong>Talent Intelligence Platform</strong></p>
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>
  `

  await EmailProvider.sendEmail(
    candidate.email,
    `Lịch phỏng vấn - ${candidate.position_applied}`,
    htmlContent
  )
}

// Gửi email thông báo lịch phỏng vấn đã được CẬP NHẬT
async function sendInterviewUpdateEmail(candidate, schedule, meetingLink) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${emailBaseStyles}
    .header { background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lịch phỏng vấn đã được cập nhật</h1>
      <p>${schedule.position_applied || candidate.position_applied}</p>
    </div>
    <div class="content">
      <p class="greeting">Chào <strong>${candidate.name}</strong>,</p>
      <p>Lịch phỏng vấn của bạn cho vị trí <strong>${schedule.position_applied || candidate.position_applied}</strong> vừa được cập nhật với thông tin mới như sau:</p>
      <div class="info">
        <div class="info-item"><span class="label">Thời gian:</span><span class="value">${formatScheduleDate(schedule.interview_date)}</span></div>
        <div class="info-item"><span class="label">Thời lượng:</span><span class="value">${schedule.duration} phút</span></div>
        <div class="info-item"><span class="label">Địa điểm:</span><span class="value">${schedule.location || 'Online Meeting'}</span></div>
        ${schedule.notes ? `<div class="info-item"><span class="label">Ghi chú:</span><span class="value">${schedule.notes}</span></div>` : ''}
      </div>
      ${meetingLink ? `
      <div style="margin: 20px 0;">
        <p style="font-weight: 600; margin-bottom: 8px;">Link tham gia phỏng vấn:</p>
        <div class="meet-link-box"><a href="${meetingLink}" target="_blank">${meetingLink}</a></div>
      </div>
      <div class="button-container"><a href="${meetingLink}" class="button" target="_blank">Tham gia phỏng vấn</a></div>
      ` : ''}
      <div class="note"><strong>Lưu ý:</strong> Vui lòng kiểm tra kỹ thời gian mới và tham gia đúng giờ.</div>
      <p style="margin-top: 20px; color: #555;">Cảm ơn bạn!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} <strong>Talent Intelligence Platform</strong></p>
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>
  `

  await EmailProvider.sendEmail(
    candidate.email,
    `[Cập nhật] Lịch phỏng vấn - ${schedule.position_applied || candidate.position_applied}`,
    htmlContent
  )
}

// Gửi email thông báo lịch phỏng vấn đã bị HỦY
async function sendInterviewCancellationEmail(candidate, schedule) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${emailBaseStyles}
    .header { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Lịch phỏng vấn đã bị hủy</h1>
      <p>${schedule.position_applied || candidate.position_applied}</p>
    </div>
    <div class="content">
      <p class="greeting">Chào <strong>${candidate.name}</strong>,</p>
      <p>Lịch phỏng vấn của bạn cho vị trí <strong>${schedule.position_applied || candidate.position_applied}</strong> đã bị hủy.</p>
      <div class="info">
        <div class="info-item"><span class="label">Thời gian cũ:</span><span class="value">${formatScheduleDate(schedule.interview_date)}</span></div>
      </div>
      <div class="note"><strong>Lưu ý:</strong> Nếu bạn có thắc mắc về việc này, vui lòng liên hệ với bộ phận tuyển dụng của chúng tôi. Chúng tôi sẽ sớm liên hệ lại nếu có lịch phỏng vấn mới.</div>
      <p style="margin-top: 20px; color: #555;">Cảm ơn bạn đã quan tâm đến vị trí này.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} <strong>Talent Intelligence Platform</strong></p>
      <p>Email này được gửi tự động, vui lòng không trả lời.</p>
    </div>
  </div>
</body>
</html>
  `

  await EmailProvider.sendEmail(
    candidate.email,
    `[Đã hủy] Lịch phỏng vấn - ${schedule.position_applied || candidate.position_applied}`,
    htmlContent
  )
}

export default calendarService