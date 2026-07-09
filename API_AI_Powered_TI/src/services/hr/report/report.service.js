import analysisModel from '~/models/hr/analysis/analysis.model'
import candidateModel from '~/models/candidate/candidate.model'
import { EmailProvider } from '~/providers/email.provider'
import { generateReportHTML } from '~/services/email/report.template'
import { emitToCandidate, emitToUser } from '~/providers/socket.provider'

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

    // 7. Gửi thông báo real-time cho candidate
    emitToCandidate(candidateId, 'report:sent', {
      candidateId: candidate.id,
      candidateName: candidate.name,
      positionApplied: candidate.position_applied,
      overallScore: analysisResult.overall?.score || 0,
      recommendation: analysisResult.overall?.recommendation || 'need_more_info',
      sentAt: new Date().toISOString(),
      message: 'Bạn đã nhận được báo cáo đánh giá hồ sơ từ nhà tuyển dụng'
    })

    // 8. Gửi thông báo cho HR (xác nhận đã gửi)
    emitToUser(hrId, 'report:sent:confirm', {
      candidateId: candidate.id,
      candidateName: candidate.name,
      email: candidate.email,
      sentAt: new Date().toISOString()
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