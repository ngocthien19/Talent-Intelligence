import rediscoveryModel from '~/models/hr/rediscovery/rediscovery.model'
import { generateStructuredContent } from '~/providers/gemini.provider'
import { createQueue, addJob } from '~/providers/queue.provider'
import { SocketProvider } from '~/providers/socket.provider'
import notificationService from '~/services/notification/notification.service'

const rediscoveryQueue = createQueue('rediscovery')

const rediscoveryService = {
  // So khớp ứng viên với JD (đồng bộ)
  matchCandidatesWithJD: async (jdId, threshold = 60) => {
    // 1. Lấy thông tin JD
    const jd = await rediscoveryModel.getJDById(jdId)
    if (!jd) {
      throw new Error('Không tìm thấy JD')
    }

    // 2. Lấy danh sách ứng viên cũ
    const candidates = await rediscoveryModel.getOldCandidates(jd.company_id, 100)

    if (candidates.length === 0) {
      return {
        totalMatched: 0,
        topMatches: [],
        message: 'Không có ứng viên cũ để quét'
      }
    }

    // 3. So khớp từng ứng viên với JD
    const matches = []
    const requiredSkills = jd.required_skills || []
    const niceToHaveSkills = jd.nice_to_have_skills || []

    for (const candidate of candidates) {
      // Bỏ qua nếu đã rediscovery trước đó
      const hasRediscovered = await rediscoveryModel.hasRediscovered(jdId, candidate.id)
      if (hasRediscovered) continue

      // Lấy kỹ năng của ứng viên
      const candidateSkills = candidate.parsed_data?.skills || []

      // Tính điểm match
      const matchResult = calculateSkillsMatch(candidateSkills, requiredSkills, niceToHaveSkills)

      if (matchResult.score >= threshold) {
        // Lưu kết quả
        const saved = await rediscoveryModel.saveRediscovery({
          jdId,
          candidateId: candidate.id,
          matchScore: matchResult.score,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          suggestions: matchResult.suggestions,
          analysisData: {
            candidate: {
              name: candidate.name,
              position_applied: candidate.position_applied,
              overall_score: candidate.overall_score,
              status: candidate.status
            },
            jd: {
              title: jd.title,
              required_skills: requiredSkills
            },
            matchDetails: matchResult
          }
        })

        matches.push({
          ...saved,
          candidate_name: candidate.name,
          candidate_email: candidate.email,
          position_applied: candidate.position_applied,
          candidate_score: candidate.overall_score,
          matchScore: matchResult.score
        })
      }
    }

    // 4. Sắp xếp theo match score
    matches.sort((a, b) => b.matchScore - a.matchScore)

    // 5. Cập nhật trạng thái cho những ứng viên có điểm cao
    const topMatches = matches.slice(0, 5)
    for (const match of topMatches) {
      await rediscoveryModel.updateRediscoveryStatus(match.id, 'shortlisted')
    }

    if (topMatches.length > 0) {
      // Gửi thông báo cho toàn bộ công ty (tất cả HR)
      await notificationService.sendToCompany(jd.company_id, {
        type: 'rediscovery_match',
        title: `Tìm thấy ${topMatches.length} ứng viên phù hợp`,
        content: `Tìm thấy ${topMatches.length} ứng viên cũ phù hợp với vị trí "${jd.title}"`,
        extraData: {
          jdId: jd.id,
          jdTitle: jd.title,
          totalMatched: matches.length,
          topMatches: topMatches.map(m => ({
            id: m.candidate_id,
            name: m.candidate_name,
            email: m.candidate_email,
            matchScore: m.matchScore,
            positionApplied: m.position_applied
          }))
        }
      })

      // Gửi thông báo cho từng ứng viên được shortlist
      for (const match of topMatches) {
        await notificationService.sendToCandidate(match.candidate_id, {
          type: 'rediscovery_opportunity',
          title: `Cơ hội việc làm mới: ${jd.title}`,
          content: `Có một vị trí "${jd.title}" phù hợp với bạn. Hãy kiểm tra và ứng tuyển ngay!`,
          extraData: {
            jdId: jd.id,
            jdTitle: jd.title,
            matchScore: match.matchScore,
            matchedSkills: match.matched_skills,
            missingSkills: match.missing_skills
          }
        })
      }
    }

    return {
      totalMatched: matches.length,
      topMatches: matches.slice(0, 10),
      jdTitle: jd.title,
      threshold
    }
  },

  // CHẠY REDISCOVERY BẤT ĐỒNG BỘ

  runRediscoveryAsync: async (jdId, companyId, userId, threshold = 60) => {
    // Gửi thông báo bắt đầu rediscovery cho HR
    await notificationService.sendToHR(userId, {
      type: 'rediscovery_started',
      title: 'Đang tìm kiếm ứng viên phù hợp',
      content: 'Hệ thống đang quét kho ứng viên cũ cho vị trí này. Vui lòng chờ trong giây lát.',
      extraData: {
        jdId: jdId,
        status: 'processing'
      }
    })

    // Thêm vào queue
    const job = await addJob(rediscoveryQueue, 'rediscovery-match', {
      jdId,
      companyId,
      userId,
      threshold
    })

    return {
      success: true,
      message: 'Đã thêm vào hàng đợi rediscovery',
      jobId: job.id,
      status: 'queued'
    }
  },

  // LẤY KẾT QUẢ REDISCOVERY

  getRediscoveryResults: async (jdId, limit = 20) => {
    const results = await rediscoveryModel.getRediscoveryByJD(jdId, limit)
    return results
  },

  getRediscoveryCount: async (jdId) => {
    return await rediscoveryModel.getRediscoveryCount(jdId)
  },

  // GỬI THÔNG BÁO CHO ỨNG VIÊN

  notifyCandidates: async (jdId) => {
    const results = await rediscoveryModel.getRediscoveryByJD(jdId, 10)
    const notified = []

    for (const result of results) {
      if (result.status === 'shortlisted' && !result.notified) {

        // Gửi notification cho ứng viên
        await notificationService.sendToCandidate(result.candidate_id, {
          type: 'rediscovery_reminder',
          title: `Cơ hội việc làm: ${result.jd_title || 'Vị trí mới'}`,
          content: 'Có một cơ hội việc làm mới phù hợp với bạn. Hãy kiểm tra ngay!',
          extraData: {
            jdId: jdId,
            matchScore: result.match_score,
            status: result.status
          }
        })

        notified.push(result.candidate_id)
      }
    }

    return {
      notifiedCount: notified.length,
      candidates: notified
    }
  }
}

// HÀM TÍNH ĐIỂM SO KHỚP

function calculateSkillsMatch(candidateSkills, requiredSkills, niceToHaveSkills = []) {
  // Chuẩn hóa skills (lowercase)
  const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase().trim())
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase().trim())
  const niceToHaveSkillsLower = niceToHaveSkills.map(s => s.toLowerCase().trim())

  // Tìm skills match
  const matchedRequired = []
  const missingRequired = []
  const matchedNice = []

  for (const skill of requiredSkillsLower) {
    if (candidateSkillsLower.includes(skill)) {
      matchedRequired.push(skill)
    } else {
      missingRequired.push(skill)
    }
  }

  for (const skill of niceToHaveSkillsLower) {
    if (candidateSkillsLower.includes(skill)) {
      matchedNice.push(skill)
    }
  }

  // Tính điểm
  const requiredTotal = requiredSkillsLower.length || 1
  const requiredScore = (matchedRequired.length / requiredTotal) * 70

  const niceTotal = niceToHaveSkillsLower.length || 1
  const niceScore = (matchedNice.length / niceTotal) * 30

  const totalScore = Math.round(requiredScore + niceScore)

  // Tạo suggestions
  const suggestions = []
  if (missingRequired.length > 0) {
    suggestions.push(`Thiếu các kỹ năng: ${missingRequired.join(', ')}`)
  }
  if (niceToHaveSkills.length > 0 && matchedNice.length === 0) {
    suggestions.push('Chưa có kỹ năng bổ sung (nice-to-have)')
  }

  return {
    score: Math.min(totalScore, 100),
    matchedSkills: [...matchedRequired, ...matchedNice],
    missingSkills: missingRequired,
    suggestions,
    details: {
      matchedRequired,
      missingRequired,
      matchedNice,
      requiredScore: Math.round(requiredScore),
      niceScore: Math.round(niceScore)
    }
  }
}

export default rediscoveryService