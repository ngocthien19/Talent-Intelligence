import semanticSearchModel from '~/models/hr/semantic-search/semantic-search.model'
import { generateEmbedding } from '~/providers/gemini.provider'
import applicationModel from '~/models/candidate/application.model'
import candidateProfileModel from '~/models/candidate/candidate-profile.model'

const semanticSearchService = {
  // Tạo embedding cho candidate (gọi khi upload CV hoặc phân tích)
  generateCandidateEmbedding: async (applicationId) => {
    // 1. Lấy thông tin application và profile
    const application = await applicationModel.findByIdAdmin(applicationId)
    if (!application) {
      throw new Error('Không tìm thấy đơn ứng tuyển')
    }

    const profile = await candidateProfileModel.findById(application.candidate_profile_id)
    if (!profile) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    // 2. Tạo text để embedding (kết hợp các thông tin)
    const skills = profile.parsed_data?.skills || []
    const skillsText = skills.join(', ')

    const textForEmbedding = `
      Tên: ${profile.name}
      Vị trí ứng tuyển: ${application.position}
      Kỹ năng: ${skillsText}
      Mô tả công việc: ${application.jd_text || ''}
      CV: ${profile.cv_text || ''}
    `.trim()

    if (!textForEmbedding || textForEmbedding.length < 10) {
      throw new Error('Không đủ dữ liệu để tạo embedding')
    }

    // 3. Gọi Gemini embedding
    const embedding = await generateEmbedding(textForEmbedding)

    // 4. Lưu vào database (sử dụng application_id)
    await semanticSearchModel.saveEmbedding(applicationId, embedding, 'full_text')

    return {
      success: true,
      applicationId,
      embeddingLength: embedding.length
    }
  },

  // Tìm kiếm ngữ nghĩa
  semanticSearch: async (query, companyId, filters = {}, limit = 20) => {
    // 1. Tạo embedding cho query
    const embedding = await generateEmbedding(query)

    // 2. Tìm kiếm
    const results = await semanticSearchModel.semanticSearchWithFilter(
      embedding,
      { ...filters, companyId },
      limit,
      0.6 // threshold
    )

    // 3. Format kết quả
    return results.map(r => ({
      ...r,
      similarity: Math.round(r.similarity * 100) / 100
    }))
  },

  // Tạo embedding cho tất cả candidates (chạy 1 lần)
  generateAllEmbeddings: async (companyId) => {
    const applications = await semanticSearchModel.getApplicationIdsByCompany(companyId)

    const results = []
    for (const app of applications) {
      try {
        const result = await semanticSearchService.generateCandidateEmbedding(app.id)
        results.push({ id: app.id, success: true })
      } catch (error) {
        results.push({ id: app.id, success: false, error: error.message })
      }
    }

    return results
  },

  // Kiểm tra embedding đã tồn tại
  hasEmbedding: async (applicationId) => {
    return await semanticSearchModel.hasEmbedding(applicationId)
  },

  // Xóa embedding
  deleteEmbedding: async (applicationId) => {
    return await semanticSearchModel.deleteEmbedding(applicationId)
  }
}

export default semanticSearchService