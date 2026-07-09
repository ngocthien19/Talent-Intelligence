import comparisonModel from '~/models/hr/comparison/comparison.model'

const comparisonService = {
  // So sánh các ứng viên
  compareCandidates: async (candidateIds, companyId) => {
    // 1. Lấy thông tin các ứng viên
    const candidates = await comparisonModel.getCandidatesForComparison(candidateIds, companyId)

    if (candidates.length < 2) {
      throw new Error('Cần ít nhất 2 ứng viên để so sánh')
    }

    // 2. Xây dựng bảng so sánh
    const comparisonData = candidates.map(candidate => {
      // Parse skills từ parsed_data
      const skills = candidate.parsed_data?.skills || []

      // Parse analysis result
      let analysisResult = null
      if (candidate.analysis_result) {
        try {
          analysisResult = typeof candidate.analysis_result === 'string'
            ? JSON.parse(candidate.analysis_result)
            : candidate.analysis_result
        } catch {
          analysisResult = null
        }
      }

      return {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        phone: candidate.phone,
        positionApplied: candidate.position_applied,
        jobTitle: candidate.job_title,
        companyName: candidate.company_name,
        status: candidate.status,
        created_at: candidate.created_at,
        scores: {
          overall: candidate.overall_score || 0,
          skillsMatch: candidate.skills_match_score || 0,
          cultureFit: candidate.culture_fit_score || 0,
          retention: candidate.retention_score || 0
        },
        skills: skills,
        requiredSkills: candidate.required_skills || [],
        niceToHaveSkills: candidate.nice_to_have_skills || [],
        strengths: candidate.strengths || [],
        weaknesses: candidate.weaknesses || [],
        suggestions: candidate.suggestions || [],
        analysisSummary: candidate.analysis_explanation || '',
        cvUrl: candidate.cv_url,
        // Đánh giá tổng quan
        summary: analysisResult?.overall?.summary || '',
        recommendation: analysisResult?.overall?.recommendation || 'need_more_info'
      }
    })

    // 3. Tính toán các chỉ số so sánh
    const maxScore = Math.max(...comparisonData.map(c => c.scores.overall))
    const minScore = Math.min(...comparisonData.map(c => c.scores.overall))
    const avgScore = comparisonData.reduce((sum, c) => sum + c.scores.overall, 0) / comparisonData.length

    // 4. Tìm ứng viên phù hợp nhất
    const bestMatch = comparisonData.reduce((best, current) => {
      return current.scores.overall > best.scores.overall ? current : best
    }, comparisonData[0])

    // 5. Tìm skills chung và skills riêng
    const allSkills = comparisonData.flatMap(c => c.skills)
    const skillFrequency = {}
    allSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1
    })

    const commonSkills = Object.keys(skillFrequency).filter(s => skillFrequency[s] >= comparisonData.length)
    const uniqueSkills = Object.keys(skillFrequency).filter(s => skillFrequency[s] === 1)

    // 6. Xếp hạng
    const ranked = [...comparisonData].sort((a, b) => b.scores.overall - a.scores.overall)
    const rankings = ranked.map((c, index) => ({
      rank: index + 1,
      ...c
    }))

    return {
      comparison: comparisonData,
      rankings,
      statistics: {
        totalCandidates: comparisonData.length,
        maxScore,
        minScore,
        avgScore: Math.round(avgScore * 10) / 10,
        bestMatch: {
          id: bestMatch.id,
          name: bestMatch.name,
          score: bestMatch.scores.overall,
          position: bestMatch.positionApplied
        }
      },
      insights: {
        commonSkills,
        uniqueSkills,
        skillFrequency
      },
      recommendation: {
        bestCandidate: bestMatch,
        reason: `${bestMatch.name} có điểm tổng quan cao nhất (${bestMatch.scores.overall}/100) với kỹ năng phù hợp và đánh giá tích cực từ AI.`,
        summary: `Trong ${comparisonData.length} ứng viên, ${bestMatch.name} nổi bật nhất với điểm số ${bestMatch.scores.overall}/100.`
      }
    }
  },

  // So sánh 2 ứng viên (nhanh)
  compareTwo: async (candidateId1, candidateId2, companyId) => {
    return await comparisonService.compareCandidates([candidateId1, candidateId2], companyId)
  }
}

export default comparisonService