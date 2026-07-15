import comparisonService from '~/services/hr/comparison/comparison.service'

const comparisonController = {
  // So sánh nhiều ứng viên
  compareCandidates: async (req, res) => {
    try {
      const { candidateIds } = req.body
      const companyId = req.user.companyId

      if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp ít nhất 2 ID ứng viên'
        })
      }

      if (candidateIds.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Chỉ có thể so sánh tối đa 5 ứng viên'
        })
      }

      const result = await comparisonService.compareCandidates(candidateIds, companyId)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // So sánh 2 ứng viên
  compareTwo: async (req, res) => {
    try {
      const { id1, id2 } = req.params
      const companyId = req.user.companyId

      const result = await comparisonService.compareTwo(id1, id2, companyId)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default comparisonController