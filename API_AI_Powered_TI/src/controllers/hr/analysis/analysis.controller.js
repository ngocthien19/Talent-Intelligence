import analysisService from '~/services/hr/analysis/analysis.service'

const analysisController = {
  // PHÂN TÍCH CV (BẤT ĐỒNG BỘ)
  analyzeCandidate: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user?.companyId
      const userId = req.user?.id

      const result = await analysisService.analyzeCandidateAsync(id, companyId, userId)

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          jobId: result.jobId,
          status: result.status
        }
      })
    } catch (error) {
      console.error('Analyze error:', error)
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // LẤY TRẠNG THÁI PHÂN TÍCH
  getAnalysisStatus: async (req, res) => {
    try {
      const { id } = req.params
      const result = await analysisService.getAnalysisStatus(id)

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

  // LẤY KẾT QUẢ PHÂN TÍCH
  getAnalysisResult: async (req, res) => {
    try {
      const { id } = req.params
      const result = await analysisService.getAnalysisResult(id)

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
  }
}

export default analysisController