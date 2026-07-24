import calendarModel from '~/models/hr/calendar/calendar.model'
import { createCalendarEvent, deleteCalendarEvent } from '~/providers/google-calendar.provider'
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

const calendarService = {
  createSchedule: async (data) => {
    const {
      applicationId,
      interviewDate,
      duration,
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

    const finalMeetLink = meetLink || generateMeetLink()

    const schedule = await calendarModel.createSchedule({
      candidateId: applicationId,
      interviewDate,
      duration,
      location: location || 'Google Meet',
      meetingLink: finalMeetLink,
      notes
    })

    if (autoCreateCalendar) {
      try {
        await calendarService.createGoogleCalendarEvent(schedule.id)
      } catch (error) {
        console.error('Failed to create Google Calendar event:', error)
      }
    }

    await sendInterviewConfirmation(candidate, schedule, finalMeetLink)

    await notificationService.sendToCandidate(profile.user_id, {
      type: 'interview_invite',
      title: `Lịch phỏng vấn - ${candidate.position_applied}`,
      content: `Bạn có lịch phỏng vấn vào lúc ${new Date(interviewDate).toLocaleString('vi-VN')}`,
      extraData: {
        scheduleId: schedule.id,
        interviewDate: interviewDate,
        duration: duration || 60,
        location: location || 'Google Meet',
        meetingLink: finalMeetLink,
        positionApplied: candidate.position_applied,
        status: schedule.status
      }
    })

    return schedule
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

    const allowedFields = ['interviewDate', 'duration', 'location', 'meetLink', 'notes']
    const updateFields = {}

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field]
      }
    })

    const dbUpdate = {
      interview_date: updateFields.interviewDate,
      duration: updateFields.duration,
      location: updateFields.location,
      meeting_link: updateFields.meetLink,
      notes: updateFields.notes
    }

    return schedule
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
        console.error('Failed to delete Google Calendar event:', error)
      }
    }

    const result = await calendarModel.updateScheduleStatus(id, 'cancelled')
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
              console.error('Failed to delete Google Calendar event:', error)
            }
          }
          const result = await calendarModel.deleteSchedule(id)
          deleted.push(result)
        }
      } catch (error) {
        console.error(`Failed to delete schedule ${id}:`, error)
      }
    }
    return deleted
  },

  createGoogleCalendarEvent: async (scheduleId) => {
    const schedule = await calendarModel.getScheduleById(scheduleId)
    if (!schedule) {
      throw new Error('Không tìm thấy lịch phỏng vấn')
    }

    const application = await applicationModel.findByIdAdmin(schedule.candidate_id)
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

// Gửi email xác nhận phỏng vấn
async function sendInterviewConfirmation(candidate, schedule, meetingLink) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
      line-height: 1.6; 
      color: #333; 
      max-width: 600px; 
      margin: 0 auto; 
      padding: 20px; 
      background: #f5f7fa;
    }
    .container {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .header { 
      background: linear-gradient(135deg, #4a6cf7 0%, #6a3de8 100%);
      color: white; 
      padding: 30px 20px; 
      text-align: center; 
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
    }
    .header p {
      margin: 8px 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content { 
      padding: 30px; 
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .greeting strong {
      color: #4a6cf7;
    }
    .info { 
      background: #f8f9fc; 
      padding: 20px; 
      border-radius: 10px; 
      margin: 20px 0; 
      border-left: 4px solid #4a6cf7; 
    }
    .info-item {
      display: flex;
      align-items: flex-start;
      margin: 8px 0;
    }
    .info-item .label {
      font-weight: 600;
      min-width: 100px;
      color: #555;
    }
    .info-item .value {
      color: #1a1a2e;
    }
    .info-item .value a {
      color: #4a6cf7;
      text-decoration: none;
    }
    .info-item .value a:hover {
      text-decoration: underline;
    }
    .meet-link-box {
      background: #f0f4ff;
      padding: 12px 16px;
      border-radius: 8px;
      margin: 10px 0;
      word-break: break-all;
      border: 1px dashed #4a6cf7;
    }
    .meet-link-box a {
      color: #4a6cf7;
      text-decoration: none;
      font-weight: 500;
    }
    .meet-link-box a:hover {
      text-decoration: underline;
    }
    .button-container {
      text-align: center;
      margin: 30px 0 20px;
    }
    .button { 
      display: inline-block; 
      background: #4a6cf7; 
      color: #ffffff !important;
      padding: 14px 40px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 600;
      font-size: 16px;
      transition: background 0.2s;
      box-shadow: 0 4px 12px rgba(74, 108, 247, 0.3);
    }
    .button:hover {
      background: #3a56d4;
      box-shadow: 0 6px 20px rgba(74, 108, 247, 0.4);
    }
    .note {
      font-size: 14px;
      color: #888;
      margin-top: 10px;
      padding: 12px;
      background: #f8f9fc;
      border-radius: 8px;
    }
    .footer { 
      text-align: center; 
      color: #aaa; 
      font-size: 12px; 
      padding: 20px;
      border-top: 1px solid #e8ecf1;
    }
    .footer strong {
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Lịch phỏng vấn</h1>
      <p>${candidate.position_applied}</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <p class="greeting">Chào <strong>${candidate.name}</strong>,</p>
      <p>Bạn đã được sắp xếp lịch phỏng vấn cho vị trí <strong>${candidate.position_applied}</strong>.</p>
      
      <!-- Thông tin chi tiết -->
      <div class="info">
        <div class="info-item">
          <span class="label">Thời gian:</span>
          <span class="value">${new Date(schedule.interview_date).toLocaleString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}</span>
        </div>
        <div class="info-item">
          <span class="label">Thời lượng:</span>
          <span class="value">${schedule.duration} phút</span>
        </div>
        <div class="info-item">
          <span class="label">Địa điểm:</span>
          <span class="value">${schedule.location || 'Online Meeting'}</span>
        </div>
        ${schedule.notes ? `
        <div class="info-item">
          <span class="label">Ghi chú:</span>
          <span class="value">${schedule.notes}</span>
        </div>` : ''}
      </div>

      <!-- Link tham gia -->
      ${meetingLink ? `
      <div style="margin: 20px 0;">
        <p style="font-weight: 600; margin-bottom: 8px;">Link tham gia phỏng vấn:</p>
        <div class="meet-link-box">
          <a href="${meetingLink}" target="_blank">${meetingLink}</a>
        </div>
      </div>
      ` : ''}

      <!-- Nút tham gia -->
      ${meetingLink ? `
      <div class="button-container">
        <a href="${meetingLink}" class="button" target="_blank">Tham gia phỏng vấn</a>
      </div>
      ` : ''}

      <!-- Lưu ý -->
      <div class="note">
        <strong>Lưu ý:</strong> Vui lòng tham gia đúng giờ. Nếu có bất kỳ thay đổi, hãy liên hệ với chúng tôi.
      </div>
      
      <p style="margin-top: 20px; color: #555;">Chúc bạn may mắn!</p>
    </div>
    
    <!-- Footer -->
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

export default calendarService