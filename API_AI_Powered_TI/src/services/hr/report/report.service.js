import analysisModel from '~/models/hr/analysis/analysis.model'
import candidateModel from '~/models/candidate/candidate.model'
import { EmailProvider } from '~/providers/email.provider'
import { generateReportHTML } from '~/services/email/report.template'
import notificationService from '~/services/notification/notification.service'

const reportService = {
  sendReport: async (candidateId, hrId) => {
    // 1. Lấy thông tin candidate
    const candidate = await candidateModel.findByIdAdmin(candidateId)
    if (!candidate) {
      throw new Error('Không tìm thấy ứng viên')
    }

    // 2. Lấy kết quả phân tích
    const analysis = await analysisModel.getAnalysisResult(candidateId)
    if (!analysis) {
      throw new Error('Ứng viên chưa được phân tích')
    }

    // 3. Parse kết quả
    const analysisResult = typeof analysis.result === 'string'
      ? JSON.parse(analysis.result)
      : analysis.result

    // 4. Tạo nội dung email
    const htmlContent = generateReportHTML(candidate, {
      result: analysisResult
    })

    // 5. Gửi email
    await EmailProvider.sendEmail(
      candidate.email,
      `Kết quả đánh giá hồ sơ - ${candidate.position_applied}`,
      htmlContent
    )

    // 6. Cập nhật trạng thái đã gửi
    await candidateModel.updateNotified(candidateId)

    // 7. Gửi thông báo cho Candidate
    await notificationService.sendToCandidate(candidateId, {
      type: 'report_sent',
      title: 'Báo cáo đánh giá hồ sơ',
      content: `Báo cáo đánh giá cho vị trí "${candidate.position_applied}" đã được gửi đến email của bạn.`,
      extraData: {
        candidateId: candidate.id,
        candidateName: candidate.name,
        positionApplied: candidate.position_applied,
        overallScore: analysisResult.overall?.score || 0,
        recommendation: analysisResult.overall?.recommendation || 'need_more_info',
        sentAt: new Date().toISOString()
      }
    })

    // 8. Gửi thông báo cho HR (xác nhận đã gửi)
    await notificationService.sendToHR(hrId, {
      type: 'report_sent_confirm',
      title: `Đã gửi báo cáo cho ${candidate.name}`,
      content: `Báo cáo đánh giá đã được gửi đến email của ${candidate.name}`,
      extraData: {
        candidateId: candidate.id,
        candidateName: candidate.name,
        email: candidate.email,
        positionApplied: candidate.position_applied,
        sentAt: new Date().toISOString()
      }
    })

    return {
      success: true,
      message: 'Đã gửi báo cáo thành công',
      email: candidate.email,
      sentAt: new Date().toISOString()
    }
  },

  checkSent: async (candidateId) => {
    const result = await candidateModel.checkNotified(candidateId)
    if (!result) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return result
  }
}

export default reportService