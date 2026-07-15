import semanticSearchService from '~/services/hr/semantic-search/semantic-search.service'
import semanticSearchModel from '~/models/hr/semantic-search/semantic-search.model'

const semanticSearchController = {
  // Tìm kiếm ngữ nghĩa
  semanticSearch: async (req, res) => {
    try {
      const companyId = req.user?.companyId
      const { q, status, minScore, maxScore, startDate, endDate, limit = 20 } = req.query

      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập từ khóa tìm kiếm (tối thiểu 2 ký tự)'
        })
      }

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      const results = await semanticSearchService.semanticSearch(q, companyId, {
        status,
        minScore: minScore ? parseFloat(minScore) : undefined,
        maxScore: maxScore ? parseFloat(maxScore) : undefined,
        startDate,
        endDate
      }, parseInt(limit))

      return res.status(200).json({
        success: true,
        data: results,
        query: q,
        total: results.length
      })
    } catch (error) {
      console.error('Semantic search error:', error)
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Tạo embedding cho candidate
  generateEmbedding: async (req, res) => {
    try {
      const { id } = req.params

      const result = await semanticSearchService.generateCandidateEmbedding(id)

      return res.status(200).json({
        success: true,
        message: 'Tạo embedding thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Tạo embedding cho tất cả candidates
  generateAllEmbeddings: async (req, res) => {
    try {
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      const results = await semanticSearchService.generateAllEmbeddings(companyId)

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      return res.status(200).json({
        success: true,
        message: `Tạo embedding hoàn tất: ${successCount} thành công, ${failCount} thất bại`,
        data: results
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Kiểm tra embedding
  checkEmbedding: async (req, res) => {
    try {
      const { id } = req.params

      const hasEmbedding = await semanticSearchService.hasEmbedding(id)
      const embeddings = await semanticSearchModel.getCandidateEmbeddings(id)

      return res.status(200).json({
        success: true,
        data: {
          hasEmbedding,
          embeddings
        }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa embedding
  deleteEmbedding: async (req, res) => {
    try {
      const { id } = req.params

      await semanticSearchService.deleteEmbedding(id)

      return res.status(200).json({
        success: true,
        message: 'Xóa embedding thành công'
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default semanticSearchController