import analysisModel from '~/models/hr/analysis/analysis.model'
import applicationModel from '~/models/candidate/application.model'
import candidateProfileModel from '~/models/candidate/candidate-profile.model'
import { EmailProvider } from '~/providers/email.provider'
import { generateReportHTML } from '~/services/email/report.template'
import notificationService from '~/services/notification/notification.service'

const reportService = {
  sendReport: async (applicationId, hrId) => {
    // 1. Lấy thông tin application và candidate profile
    const application = await applicationModel.findByIdAdmin(applicationId)
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển')
    }

    // Lấy thông tin profile
    const profile = await candidateProfileModel.findById(application.candidate_profile_id)
    if (!profile) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    // 2. Lấy kết quả phân tích
    const analysis = await analysisModel.getAnalysisResult(applicationId)
    if (!analysis) {
      throw new Error('Ứng viên chưa được phân tích')
    }

    // 3. Parse kết quả
    const analysisResult = typeof analysis.result === 'string'
      ? JSON.parse(analysis.result)
      : analysis.result

    // 4. Tạo nội dung email với dữ liệu kết hợp
    const candidateData = {
      ...application,
      ...profile,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address
    }

    const htmlContent = generateReportHTML(candidateData, {
      result: analysisResult
    })

    // 5. Gửi email
    await EmailProvider.sendEmail(
      profile.email,
      `Kết quả đánh giá hồ sơ - ${application.position}`,
      htmlContent
    )

    // 6. Cập nhật trạng thái đã gửi
    await applicationModel.updateNotified(applicationId)

    // 7. Gửi thông báo cho Candidate
    await notificationService.sendToCandidate(profile.user_id, {
      type: 'report_sent',
      title: 'Báo cáo đánh giá hồ sơ',
      content: `Báo cáo đánh giá cho vị trí "${application.position}" đã được gửi đến email của bạn.`,
      extraData: {
        applicationId: application.id,
        candidateName: profile.name,
        positionApplied: application.position,
        overallScore: analysisResult.overall?.score || 0,
        recommendation: analysisResult.overall?.recommendation || 'need_more_info',
        sentAt: new Date().toISOString()
      }
    })

    // 8. Gửi thông báo cho HR (xác nhận đã gửi)
    await notificationService.sendToHR(hrId, {
      type: 'report_sent_confirm',
      title: `Đã gửi báo cáo cho ${profile.name}`,
      content: `Báo cáo đánh giá đã được gửi đến email của ${profile.name}`,
      extraData: {
        applicationId: application.id,
        candidateName: profile.name,
        email: profile.email,
        positionApplied: application.position,
        sentAt: new Date().toISOString()
      }
    })

    return {
      success: true,
      message: 'Đã gửi báo cáo thành công',
      email: profile.email,
      sentAt: new Date().toISOString()
    }
  },

  checkSent: async (applicationId) => {
    const result = await applicationModel.checkNotified(applicationId)
    if (!result) {
      throw new Error('Không tìm thấy đơn ứng tuyển')
    }
    return result
  }
}

export default reportService