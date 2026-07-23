import jobDescriptionModel from '~/models/hr/job-description/job-description.model'
import notificationService from '~/services/notification/notification.service'
import { EmailProvider } from '~/providers/email.provider'
import categoryModel from '~/models/hr/category/category.model'
import pool from '~/config/db'

const jobDescriptionService = {
  create: async (companyId, data) => {
    if (data.categoryId) {
      const category = await categoryModel.getById(data.categoryId, companyId)
      if (!category) {
        throw new Error('Danh mục không tồn tại')
      }
    }

    const result = await jobDescriptionModel.create({
      companyId,
      ...data
    })

    const company = await pool.query(
      'SELECT name FROM companies WHERE id = $1',
      [companyId]
    )
    const companyName = company.rows[0]?.name || 'Công ty'

    // Gửi thông báo cho candidate có kỹ năng phù hợp
    await sendToMatchedCandidates(result, data, companyName)

    return result
  },

  getList: async (companyId, filters) => {
    return await jobDescriptionModel.getList({
      companyId,
      ...filters
    })
  },

  getById: async (id, companyId) => {
    const jd = await jobDescriptionModel.getById(id, companyId)
    if (!jd) {
      throw new Error('Không tìm thấy mô tả công việc')
    }
    return jd
  },

  getJobDetail: async (id, companyId) => {
    // Lấy thông tin job
    const job = await jobDescriptionModel.getById(id, companyId)
    if (!job) {
      throw new Error('Không tìm thấy mô tả công việc')
    }

    // Lấy danh sách ứng viên (5 ứng viên gần nhất)
    const candidates = await jobDescriptionModel.getCandidatesByJobId(id, companyId, 5)

    // Lấy thống kê ứng viên
    const stats = await jobDescriptionModel.getCandidateStatsByJobId(id, companyId)

    return {
      job,
      candidates,
      stats
    }
  },

  // Lấy tất cả ứng viên của job (có phân trang)
  getCandidatesByJobId: async (jobId, companyId, filters = {}) => {
    const { limit = 20, offset = 0 } = filters
    const result = await jobDescriptionModel.getCandidatesByJobId(jobId, companyId, limit, offset)
    return result
  },

  update: async (id, companyId, data) => {
    const exists = await jobDescriptionModel.exists(id, companyId)
    if (!exists) {
      throw new Error('Không tìm thấy mô tả công việc')
    }

    if (data.categoryId) {
      const category = await categoryModel.getById(data.categoryId, companyId)
      if (!category) {
        throw new Error('Danh mục không tồn tại')
      }
    }

    return await jobDescriptionModel.update(id, companyId, data)
  },

  delete: async (id, companyId) => {
    const result = await jobDescriptionModel.delete(id, companyId)
    if (!result) {
      throw new Error('Không tìm thấy mô tả công việc')
    }
    return result
  },

  getTotalCount: async (companyId) => {
    return await jobDescriptionModel.getTotalCount(companyId)
  },

  // Bulk action
  bulkAction: async (companyId, ids, action) => {
    // Kiểm tra ids có tồn tại không
    const existingIds = await jobDescriptionModel.checkIdsExist(ids, companyId)

    if (existingIds.length === 0) {
      throw new Error('Không tìm thấy công việc nào')
    }

    // Kiểm tra nếu có id không tồn tại
    const notFoundIds = ids.filter(id => !existingIds.includes(id))
    if (notFoundIds.length > 0) {
      throw new Error(`Không tìm thấy công việc với ID: ${notFoundIds.join(', ')}`)
    }

    let result = []
    let message = ''

    switch (action) {
      case 'delete':
        result = await jobDescriptionModel.bulkDelete(ids, companyId)
        message = `Đã xóa ${result.length} công việc thành công`
        break

      case 'activate':
        result = await jobDescriptionModel.bulkUpdateStatus(ids, companyId, true)
        message = `Đã kích hoạt ${result.length} công việc thành công`
        break

      case 'deactivate':
        result = await jobDescriptionModel.bulkUpdateStatus(ids, companyId, false)
        message = `Đã tạm dừng ${result.length} công việc thành công`
        break

      default:
        throw new Error('Hành động không hợp lệ')
    }

    return {
      message,
      data: result,
      total: result.length
    }
  }
}

// GỬI THÔNG BÁO CHO CANDIDATE CÓ KỸ NĂNG PHÙ HỢP
async function sendToMatchedCandidates(job, data, companyName) {
  const requiredSkills = data.requiredSkills || []

  if (requiredSkills.length === 0) {
    return
  }

  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase().trim())

  // Lấy tất cả candidate profiles có skills
  const query = `
    SELECT 
      a.id as application_id,
      cp.user_id,
      u.id as user_id,
      u.email, 
      u.fullname, 
      cp.parsed_data,
      cp.skills
    FROM applications a
    JOIN candidate_profiles cp ON a.candidate_profile_id = cp.id
    JOIN users u ON cp.user_id = u.id
    WHERE u.role_id = (SELECT id FROM roles WHERE name = 'candidate')
    AND u.is_active = true
    AND cp.skills IS NOT NULL
    GROUP BY a.id, cp.user_id, u.id, u.email, u.fullname, cp.parsed_data, cp.skills
    ORDER BY u.id
  `

  const candidates = await pool.query(query)

  // Lọc và xử lý trong JavaScript
  for (const candidate of candidates.rows) {
    // Xử lý skills - cả object và array
    let candidateSkills = []

    if (Array.isArray(candidate.skills)) {
      candidateSkills = candidate.skills
    } else if (typeof candidate.skills === 'object' && candidate.skills !== null) {
      // Nếu là object, lấy values
      candidateSkills = Object.values(candidate.skills)
    }

    // Chuẩn hóa và kiểm tra có skill phù hợp không
    const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim())

    // Kiểm tra có ít nhất 1 skill trùng khớp
    const hasMatchingSkill = normalizedRequiredSkills.some(skill =>
      normalizedCandidateSkills.includes(skill)
    )

    if (!hasMatchingSkill) {
      continue // Bỏ qua nếu không có skill phù hợp
    }

    const matchedSkills = requiredSkills.filter(skill =>
      normalizedCandidateSkills.includes(skill.toLowerCase().trim())
    )

    const matchCount = matchedSkills.length
    const totalRequired = requiredSkills.length

    // Gửi notification real-time
    try {
      await notificationService.sendToCandidate(candidate.application_id, {
        type: 'new_job_opportunity_matched',
        title: `Việc làm phù hợp với bạn: ${data.title}`,
        content: `Công ty ${companyName} đang tuyển vị trí "${data.title}". Bạn có ${matchCount}/${totalRequired} kỹ năng phù hợp!`,
        extraData: {
          jobId: job.id,
          jobTitle: data.title,
          companyName: companyName,
          location: data.location,
          employmentType: data.employmentType,
          experienceLevel: data.experienceLevel,
          requiredSkills: requiredSkills,
          matchedSkills: matchedSkills,
          matchCount: matchCount,
          totalRequired: totalRequired
        }
      })
    } catch (error) {
      // console.error('Failed to send notification:', error)
    }

    // Gửi email
    if (candidate.email) {
      try {
        await sendJobAlertEmail(candidate, job, data, companyName, matchedSkills, matchCount, totalRequired)
      } catch (error) {
        // console.error('Failed to send email:', error)
      }
    }
  }
}

// GỬI EMAIL JOB ALERT CHO CANDIDATE
async function sendJobAlertEmail(candidate, job, data, companyName, matchedSkills, matchCount, totalRequired) {
  const requiredSkills = data.requiredSkills || []
  const matchedSkillsList = matchedSkills || []

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
    .container { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4a6cf7 0%, #6a3de8 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; opacity: 0.9; font-size: 16px; }
    .content { padding: 30px; }
    .greeting { font-size: 18px; margin-bottom: 20px; }
    .greeting strong { color: #4a6cf7; }
    .job-info { background: #f8f9fc; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #4a6cf7; }
    .job-info-item { display: flex; align-items: flex-start; margin: 8px 0; }
    .job-info-item .label { font-weight: 600; min-width: 120px; color: #555; }
    .job-info-item .value { color: #1a1a2e; }
    .match-box { background: #e8f5e9; padding: 15px 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
    .match-box .match-count { font-size: 20px; font-weight: 700; color: #2e7d32; }
    .skill-tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; margin: 3px 4px 3px 0; }
    .skill-tag.matched { background: #c8e6c9; color: #2e7d32; }
    .skill-tag.missing { background: #ffcdd2; color: #c62828; }
    .button { display: inline-block; background: #4a6cf7; color: #ffffff !important; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(74, 108, 247, 0.3); }
    .button:hover { background: #3a56d4; box-shadow: 0 6px 20px rgba(74, 108, 247, 0.4); }
    .footer { text-align: center; color: #aaa; font-size: 12px; padding: 20px; border-top: 1px solid #e8ecf1; }
    .footer strong { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💼 Cơ hội việc làm mới</h1>
      <p>Dành riêng cho bạn</p>
    </div>
    
    <div class="content">
      <p class="greeting">Chào <strong>${candidate.fullname}</strong>,</p>
      <p>Có một vị trí việc làm mới phù hợp với kỹ năng của bạn!</p>
      
      <div class="job-info">
        <div class="job-info-item">
          <span class="label">📌 Vị trí:</span>
          <span class="value"><strong>${data.title}</strong></span>
        </div>
        <div class="job-info-item">
          <span class="label">🏢 Công ty:</span>
          <span class="value">${companyName}</span>
        </div>
        ${data.location ? `
        <div class="job-info-item">
          <span class="label">📍 Địa điểm:</span>
          <span class="value">${data.location}</span>
        </div>` : ''}
        ${data.employmentType ? `
        <div class="job-info-item">
          <span class="label">📋 Loại hình:</span>
          <span class="value">${data.employmentType}</span>
        </div>` : ''}
        ${data.experienceLevel ? `
        <div class="job-info-item">
          <span class="label">⭐ Cấp bậc:</span>
          <span class="value">${data.experienceLevel}</span>
        </div>` : ''}
      </div>

      <div class="match-box">
        <p style="margin: 0 0 5px; font-weight: 600; color: #2e7d32;">✅ Kỹ năng của bạn phù hợp</p>
        <p style="margin: 0;">
          Bạn có <span class="match-count">${matchCount}/${totalRequired}</span> kỹ năng phù hợp với vị trí này:
        </p>
        <div style="margin-top: 10px;">
          ${requiredSkills.map(skill => {
    const isMatched = matchedSkillsList.some(ms => ms.toLowerCase() === skill.toLowerCase())
    return `<span class="skill-tag ${isMatched ? 'matched' : 'missing'}">${skill} ${isMatched ? '✅' : '❌'}</span>`
  }).join('')}
        </div>
      </div>

      <p style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/jobs/${job.id}" class="button" target="_blank">🔍 Xem chi tiết & Ứng tuyển</a>
      </p>
      
      <p style="margin-top: 20px; color: #888; font-size: 14px;">
        💡 Đừng bỏ lỡ cơ hội này! Ứng tuyển ngay hôm nay.
      </p>
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
    `💼 Cơ hội việc làm mới: ${data.title} tại ${companyName}`,
    htmlContent
  )
}

export default jobDescriptionService