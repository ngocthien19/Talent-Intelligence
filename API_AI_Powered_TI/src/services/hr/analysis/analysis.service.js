import analysisModel from '~/models/hr/analysis/analysis.model'
import { generateStructuredContent } from '~/providers/gemini.provider'
import { createQueue, addJob, getJobStatus } from '~/providers/queue.provider'

// Tạo queue
const analysisQueue = createQueue('analysis')

const analysisService = {
  // PHÂN TÍCH ĐỒNG BỘ
  analyzeCandidateSync: async (candidateId) => {
    // 1. Lấy thông tin candidate và job
    const candidate = await analysisModel.getCandidateForAnalysis(candidateId)
    if (!candidate) {
      throw new Error('Không tìm thấy ứng viên')
    }

    // 2. Kiểm tra đã phân tích chưa
    const hasAnalyzed = await analysisModel.hasAnalyzed(candidateId)
    if (hasAnalyzed) {
      throw new Error('Ứng viên này đã được phân tích')
    }

    // 3. Xây dựng prompt cho Gemini
    const prompt = `
Bạn là một chuyên gia tuyển dụng AI. Hãy phân tích CV của ứng viên và đánh giá mức độ phù hợp với công việc.

=== THÔNG TIN ỨNG VIÊN ===
Tên: ${candidate.name}
Vị trí ứng tuyển: ${candidate.position_applied}
Email: ${candidate.email}
Số điện thoại: ${candidate.phone}

=== CV TEXT ===
${candidate.cv_text || 'Không có CV text'}

=== KỸ NĂNG ĐÃ PARSE ===
${JSON.stringify(candidate.parsed_data?.skills || [], null, 2)}

=== MÔ TẢ CÔNG VIỆC (JD) ===
Tiêu đề: ${candidate.job_title || candidate.position_applied}
Mô tả: ${candidate.job_description || candidate.jd_text || 'Không có mô tả'}
Yêu cầu: ${candidate.requirements || 'Không có yêu cầu cụ thể'}
Kỹ năng yêu cầu: ${JSON.stringify(candidate.required_skills || [], null, 2)}

=== VĂN HÓA CÔNG TY ===
${candidate.culture_description || 'Chưa có mô tả văn hóa'}

Vui lòng phân tích và trả về kết quả dưới dạng JSON với cấu trúc sau:
{
  "skills_match": {
    "score": 0-100,
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["skill1", "skill2"],
    "suggestions": ["gợi ý 1", "gợi ý 2"]
  },
  "culture_fit": {
    "score": 0-100,
    "analysis": "phân tích chi tiết về mức độ phù hợp văn hóa",
    "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
    "improvements": ["điểm cần cải thiện 1", "điểm cần cải thiện 2"]
  },
  "retention": {
    "score": 0-100,
    "analysis": "phân tích về khả năng gắn bó lâu dài",
    "factors": ["yếu tố 1", "yếu tố 2"],
    "advice": "lời khuyên cho HR để giữ chân"
  },
  "overall": {
    "score": 0-100,
    "summary": "tóm tắt đánh giá tổng quan",
    "strengths": ["điểm mạnh nổi bật"],
    "weaknesses": ["điểm yếu cần cải thiện"],
    "recommendation": "shortlist hoặc reject hoặc need_more_info"
  }
}
`

    // 4. Gọi Gemini
    const startTime = Date.now()
    const result = await generateStructuredContent(prompt)
    const processingTime = Date.now() - startTime

    // 5. Lưu kết quả
    const analysis = await analysisModel.saveAnalysis({
      candidate_id: candidateId,
      analysis_type: 'full_analysis',
      result: result,
      score: result.overall?.score || 0,
      explanation: result.overall?.summary || '',
      strengths: result.overall?.strengths || [],
      weaknesses: result.overall?.weaknesses || [],
      suggestions: result.skills_match?.suggestions || [],
      processing_time: processingTime
    })

    // 6. Cập nhật candidate scores
    const scores = {
      overall_score: result.overall?.score || 0,
      skills_match_score: result.skills_match?.score || 0,
      culture_fit_score: result.culture_fit?.score || 0,
      retention_score: result.retention?.score || 0
    }

    const updatedCandidate = await analysisModel.updateCandidateScores(candidateId, scores)

    return {
      analysis,
      candidate: updatedCandidate,
      result
    }
  },

  // PHÂN TÍCH BẤT ĐỒNG BỘ (Dùng Queue)
  analyzeCandidateAsync: async (candidateId, companyId, userId) => {
    // Kiểm tra đã phân tích chưa
    const hasAnalyzed = await analysisModel.hasAnalyzed(candidateId)
    if (hasAnalyzed) {
      throw new Error('Ứng viên này đã được phân tích')
    }

    // Thêm vào queue
    const job = await addJob(analysisQueue, 'analyze-cv', {
      candidateId,
      companyId,
      userId
    }, {
      // Job options
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    })

    return {
      success: true,
      message: 'Đã thêm vào hàng đợi phân tích',
      jobId: job.id,
      status: 'queued'
    }
  },

  // LẤY TRẠNG THÁI PHÂN TÍCH
  getAnalysisStatus: async (candidateId) => {
    const hasAnalyzed = await analysisModel.hasAnalyzed(candidateId)
    const analysis = await analysisModel.getAnalysisResult(candidateId)

    return {
      isAnalyzed: hasAnalyzed,
      analysis: analysis || null
    }
  },

  // LẤY KẾT QUẢ PHÂN TÍCH
  getAnalysisResult: async (candidateId) => {
    const analysis = await analysisModel.getAnalysisResult(candidateId)
    if (!analysis) {
      throw new Error('Chưa có phân tích cho ứng viên này')
    }
    return analysis
  }
}

export default analysisService