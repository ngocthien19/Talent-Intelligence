import resumeEnrichmentService from '~/services/hr/resume-enrichment/resume-enrichment.service'

const resumeEnrichmentController = {
  // Phân tích nâng cao CV
  analyzeResume: async (req, res) => {
    try {
      const { id } = req.params

      const result = await resumeEnrichmentService.analyzeResume(id)

      return res.status(200).json({
        success: true,
        message: 'Phân tích nâng cao CV thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy kết quả phân tích
  getEnrichment: async (req, res) => {
    try {
      const { id } = req.params

      const result = await resumeEnrichmentService.getEnrichment(id)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
  },

  // Kiểm tra đã phân tích chưa
  checkEnrichment: async (req, res) => {
    try {
      const { id } = req.params

      const hasEnrichment = await resumeEnrichmentService.hasEnrichment(id)

      return res.status(200).json({
        success: true,
        data: { hasEnrichment }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa phân tích
  deleteEnrichment: async (req, res) => {
    try {
      const { id } = req.params

      await resumeEnrichmentService.deleteEnrichment(id)

      return res.status(200).json({
        success: true,
        message: 'Xóa phân tích nâng cao thành công'
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default resumeEnrichmentController