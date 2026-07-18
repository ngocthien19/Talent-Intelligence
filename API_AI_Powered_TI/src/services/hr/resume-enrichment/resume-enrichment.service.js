import resumeEnrichmentModel from '~/models/hr/resume-enrichment/resume-enrichment.model'
import applicationModel from '~/models/candidate/application.model'
import candidateProfileModel from '~/models/candidate/candidate-profile.model'

const resumeEnrichmentService = {
  // Phân tích nâng cao CV
  analyzeResume: async (applicationId) => {
    // 1. Lấy thông tin application và profile
    const application = await applicationModel.findByIdAdmin(applicationId)
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển')
    }

    const profile = await candidateProfileModel.findById(application.candidate_profile_id)
    if (!profile) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    // Kết hợp dữ liệu
    const candidate = {
      ...application,
      ...profile,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      position_applied: application.position,
      cv_text: profile.cv_text,
      parsed_data: profile.parsed_data
    }

    const cvText = candidate.cv_text || ''
    const parsedData = candidate.parsed_data || {}

    // 2. Phân tích tốc độ thăng tiến
    const promotionAnalysis = await analyzePromotion(cvText, parsedData)

    // 3. Phân tích khoảng trống nghỉ việc
    const gapAnalysis = await analyzeEmploymentGaps(cvText, parsedData)

    // 4. Phân tích độ chi tiết của thành tích
    const achievementAnalysis = await analyzeAchievementDetail(cvText)

    // 5. Phân tích đa dạng kỹ năng
    const skillDiversityAnalysis = await analyzeSkillDiversity(parsedData)

    // 6. Phân tích xu hướng công nghệ
    const techAnalysis = await analyzeTechTrends(cvText, parsedData)

    // 7. Tổng hợp kết quả
    const enrichmentData = {
      candidateId: applicationId,
      promotionSpeed: promotionAnalysis.speed,
      promotionHistory: promotionAnalysis.history,
      employmentGaps: gapAnalysis.gaps,
      gapMonths: gapAnalysis.totalGapMonths,
      achievementDetailScore: achievementAnalysis.score,
      skillDiversityScore: skillDiversityAnalysis.score,
      skillDiversityDetails: skillDiversityAnalysis.details,
      techStack: techAnalysis.stack,
      techTrends: techAnalysis.trends,
      careerProgressionSummary: generateSummary(
        promotionAnalysis,
        gapAnalysis,
        achievementAnalysis,
        skillDiversityAnalysis,
        techAnalysis
      ),
      analysisRawData: {
        promotion: promotionAnalysis,
        gaps: gapAnalysis,
        achievement: achievementAnalysis,
        skillDiversity: skillDiversityAnalysis,
        tech: techAnalysis
      }
    }

    // 8. Lưu vào database
    const result = await resumeEnrichmentModel.saveEnrichment(enrichmentData)

    return result
  },

  // Lấy kết quả phân tích
  getEnrichment: async (applicationId) => {
    const result = await resumeEnrichmentModel.getEnrichment(applicationId)
    if (!result) {
      throw new Error('Chưa có phân tích nâng cao cho ứng viên này')
    }
    return result
  },

  // Kiểm tra đã phân tích chưa
  hasEnrichment: async (applicationId) => {
    return await resumeEnrichmentModel.hasEnrichment(applicationId)
  },

  // Xóa phân tích
  deleteEnrichment: async (applicationId) => {
    return await resumeEnrichmentModel.deleteEnrichment(applicationId)
  }
}

// Các hàm helper giữ nguyên (không thay đổi)
async function analyzePromotion(cvText, parsedData) {
  const jobTitles = extractJobTitles(cvText)
  const history = []
  let speed = 0

  if (jobTitles.length >= 2) {
    for (let i = 1; i < jobTitles.length; i++) {
      const prev = jobTitles[i - 1]
      const curr = jobTitles[i]
      const isPromotion = checkPromotion(prev.title, curr.title)
      history.push({
        from: prev.title,
        to: curr.title,
        fromDate: prev.date,
        toDate: curr.date,
        isPromotion
      })
    }
    const promotions = history.filter(h => h.isPromotion).length
    speed = promotions / history.length * 100
  }

  return {
    speed: Math.round(speed),
    history,
    jobCount: jobTitles.length
  }
}

async function analyzeEmploymentGaps(cvText, parsedData) {
  const dates = extractWorkDates(cvText)
  const gaps = []
  let totalGapMonths = 0

  for (let i = 1; i < dates.length; i++) {
    const prevEnd = dates[i - 1].endDate
    const currStart = dates[i].startDate
    if (prevEnd && currStart) {
      const gapMonths = calculateMonthDifference(prevEnd, currStart)
      if (gapMonths > 3) {
        gaps.push({
          from: prevEnd,
          to: currStart,
          months: gapMonths,
          reason: 'Khoảng trống > 3 tháng'
        })
        totalGapMonths += gapMonths
      }
    }
  }

  return {
    gaps,
    totalGapMonths,
    hasGap: gaps.length > 0,
    riskLevel: totalGapMonths > 12 ? 'High' : totalGapMonths > 6 ? 'Medium' : 'Low'
  }
}

async function analyzeAchievementDetail(cvText) {
  const numberRegex = /[0-9]+%?|tăng|giảm|gấp đôi|gấp ba|\d+ năm|\d+ tháng/g
  const matches = cvText.match(numberRegex) || []

  const achievementPatterns = [
    /tăng\s+[0-9]+%/gi,
    /giảm\s+[0-9]+%/gi,
    /[0-9]+\s*(triệu|tỷ|ngàn|nghìn)/gi,
    /[0-9]+\s*(năm|tháng|ngày)/gi,
    /gấp\s+[0-9]+/gi,
    /tiết kiệm\s+[0-9]+/gi
  ]

  let score = 0
  for (const pattern of achievementPatterns) {
    const count = (cvText.match(pattern) || []).length
    score += count * 2
  }

  return {
    score: Math.min(score, 100),
    hasMetrics: score > 20,
    metricCount: matches.length,
    level: score > 60 ? 'Detailed' : score > 30 ? 'Moderate' : 'Basic'
  }
}

async function analyzeSkillDiversity(parsedData) {
  const skills = parsedData.skills || []
  const categories = {
    'Programming Languages': 0,
    'Frameworks & Libraries': 0,
    'Databases': 0,
    'DevOps & Cloud': 0,
    'Soft Skills': 0,
    'Other': 0
  }

  const categoryMap = {
    'Python': 'Programming Languages',
    'JavaScript': 'Programming Languages',
    'Java': 'Programming Languages',
    'React': 'Frameworks & Libraries',
    'Node.js': 'Frameworks & Libraries',
    'Docker': 'DevOps & Cloud',
    'AWS': 'DevOps & Cloud',
    'MySQL': 'Databases',
    'PostgreSQL': 'Databases',
    'Communication': 'Soft Skills',
    'Leadership': 'Soft Skills'
  }

  for (const skill of skills) {
    const category = categoryMap[skill] || 'Other'
    categories[category] = (categories[category] || 0) + 1
  }

  const totalCategories = Object.values(categories).filter(v => v > 0).length
  const score = Math.min(totalCategories / 6 * 100, 100)

  return {
    score: Math.round(score),
    categories,
    totalCategories,
    diversityLevel: score > 80 ? 'Excellent' : score > 50 ? 'Good' : 'Average'
  }
}

async function analyzeTechTrends(cvText, parsedData) {
  const skills = parsedData.skills || []

  const techKeywords = {
    'Backend': ['Node.js', 'Express', 'Spring Boot', 'Django', 'Go', 'Ruby'],
    'Frontend': ['React', 'Vue', 'Angular', 'Svelte', 'Next.js'],
    'Cloud': ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'Terraform'],
    'Data': ['Python', 'SQL', 'Spark', 'Hadoop', 'Snowflake', 'BigQuery'],
    'Mobile': ['Flutter', 'React Native', 'Swift', 'Kotlin'],
    'DevOps': ['Jenkins', 'GitHub Actions', 'GitLab CI', 'ArgoCD']
  }

  const stack = []
  const trends = []

  for (const [category, keywords] of Object.entries(techKeywords)) {
    const found = keywords.filter(k =>
      skills.includes(k) || cvText.toLowerCase().includes(k.toLowerCase())
    )
    if (found.length > 0) {
      stack.push({ category, skills: found })
      trends.push(category)
    }
  }

  return {
    stack,
    trends,
    categories: trends,
    isModern: stack.length >= 3
  }
}

function extractJobTitles(cvText) {
  const patterns = [
    /(?:vị trí|position|title)[:\s]+([^\n]+)/gi,
    /(?:làm việc tại|work at)[:\s]+([^\n]+)/gi,
    /(?:chức vụ|role)[:\s]+([^\n]+)/gi
  ]
  const titles = []
  for (const pattern of patterns) {
    const matches = cvText.match(pattern)
    if (matches) {
      for (const match of matches) {
        const title = match.replace(/^(vị trí|position|title|làm việc tại|work at|chức vụ|role)[:\s]+/i, '').trim()
        if (title) titles.push(title)
      }
    }
  }
  return titles.map(t => ({ title: t, date: null }))
}

function extractWorkDates(cvText) {
  const dateRegex = /(\d{1,2}\/\d{4}|\d{4})\s*[-–—]\s*(\d{1,2}\/\d{4}|\d{4}|Present|Hiện tại)/gi
  const dates = []
  const matches = cvText.match(dateRegex)
  if (matches) {
    for (const match of matches) {
      const parts = match.split(/\s*[-–—]\s*/)
      if (parts.length === 2) {
        dates.push({
          startDate: parts[0].trim(),
          endDate: parts[1].trim() === 'Present' || parts[1].trim() === 'Hiện tại' ? null : parts[1].trim()
        })
      }
    }
  }
  return dates
}

function checkPromotion(from, to) {
  const seniorKeywords = ['senior', 'lead', 'principal', 'manager', 'director', 'head', 'chief', 'vp', 'c-level']
  const juniorKeywords = ['junior', 'intern', 'associate', 'entry', 'trainee']
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()
  for (const keyword of seniorKeywords) {
    if (toLower.includes(keyword) && !fromLower.includes(keyword)) return true
  }
  for (const keyword of juniorKeywords) {
    if (fromLower.includes(keyword) && !toLower.includes(keyword)) return true
  }
  return false
}

function calculateMonthDifference(start, end) {
  const [sMonth, sYear] = start.includes('/') ? start.split('/') : [1, parseInt(start)]
  const [eMonth, eYear] = end.includes('/') ? end.split('/') : [1, parseInt(end)]
  return (parseInt(eYear) - parseInt(sYear)) * 12 + (parseInt(eMonth) - parseInt(sMonth))
}

function generateSummary(promotion, gaps, achievement, skillDiversity, tech) {
  const parts = []
  if (promotion.jobCount >= 2) {
    parts.push(`Tốc độ thăng tiến: ${promotion.speed}% (${promotion.history.length} lần thăng tiến)`)
  }
  if (gaps.hasGap) {
    parts.push(`Có ${gaps.gaps.length} khoảng trống nghỉ việc (tổng ${gaps.totalGapMonths} tháng)`)
  } else {
    parts.push('Không có khoảng trống nghỉ việc')
  }
  parts.push(`Độ chi tiết thành tích: ${achievement.level} (${achievement.score}/100)`)
  parts.push(`Đa dạng kỹ năng: ${skillDiversity.diversityLevel}`)
  parts.push(`Công nghệ sử dụng: ${tech.categories.length} lĩnh vực`)
  return parts.join(' | ')
}

export default resumeEnrichmentService