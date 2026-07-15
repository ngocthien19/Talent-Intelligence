import rediscoveryService from '~/services/hr/rediscovery/rediscovery.service'

const rediscoveryController = {

  // Chạy rediscovery (đồng bộ)
  matchCandidates: async (req, res) => {
    try {
      const { jdId, threshold = 60 } = req.body

      const result = await rediscoveryService.matchCandidatesWithJD(jdId, threshold)

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

  // Chạy rediscovery (bất đồng bộ)
  matchCandidatesAsync: async (req, res) => {
    try {
      const { jdId, threshold = 60 } = req.body
      const companyId = req.user.companyId
      const userId = req.user.id

      const result = await rediscoveryService.runRediscoveryAsync(jdId, companyId, userId, threshold)

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

  getResults: async (req, res) => {
    try {
      const { jdId } = req.params
      const { limit = 20 } = req.query

      const results = await rediscoveryService.getRediscoveryResults(jdId, parseInt(limit))
      const count = await rediscoveryService.getRediscoveryCount(jdId)

      return res.status(200).json({
        success: true,
        data: results,
        pagination: {
          total: count,
          limit: parseInt(limit)
        }
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // GỬI THÔNG BÁO

  notifyCandidates: async (req, res) => {
    try {
      const { jdId } = req.params

      const result = await rediscoveryService.notifyCandidates(jdId)

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

export default rediscoveryController