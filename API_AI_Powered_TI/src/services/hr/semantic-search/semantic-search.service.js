import semanticSearchModel from '~/models/hr/semantic-search/semantic-search.model'
import { generateEmbedding } from '~/providers/gemini.provider'
import candidateModel from '~/models/candidate/candidate.model'

const semanticSearchService = {
  // Tạo embedding cho candidate (gọi khi upload CV hoặc phân tích)
  generateCandidateEmbedding: async (candidateId) => {
    // 1. Lấy thông tin candidate
    const candidate = await candidateModel.findByIdAdmin(candidateId)
    if (!candidate) {
      throw new Error('Không tìm thấy ứng viên')
    }

    // 2. Tạo text để embedding (kết hợp các thông tin)
    const skills = candidate.parsed_data?.skills || []
    const skillsText = skills.join(', ')

    const textForEmbedding = `
      Tên: ${candidate.name}
      Vị trí ứng tuyển: ${candidate.position_applied}
      Kỹ năng: ${skillsText}
      Mô tả công việc: ${candidate.jd_text || ''}
      CV: ${candidate.cv_text || ''}
    `.trim()

    if (!textForEmbedding || textForEmbedding.length < 10) {
      throw new Error('Không đủ dữ liệu để tạo embedding')
    }

    // 3. Gọi Gemini embedding
    const embedding = await generateEmbedding(textForEmbedding)

    // 4. Lưu vào database
    await semanticSearchModel.saveEmbedding(candidateId, embedding, 'full_text')

    return {
      success: true,
      candidateId,
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
    const candidates = await semanticSearchModel.getCandidateIdsByCompany(companyId)

    const results = []
    for (const candidate of candidates) {
      try {
        const result = await semanticSearchService.generateCandidateEmbedding(candidate.id)
        results.push({ id: candidate.id, success: true })
      } catch (error) {
        results.push({ id: candidate.id, success: false, error: error.message })
      }
    }

    return results
  },

  // Kiểm tra embedding đã tồn tại
  hasEmbedding: async (candidateId) => {
    return await semanticSearchModel.hasEmbedding(candidateId)
  },

  // Xóa embedding
  deleteEmbedding: async (candidateId) => {
    return await semanticSearchModel.deleteEmbedding(candidateId)
  }
}

export default semanticSearchService