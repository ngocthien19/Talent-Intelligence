import dashboardService from '~/services/hr/dashboard/dashboard.service'

const dashboardController = {
  getDashboard: async (req, res) => {
    try {
      const companyId = req.user?.companyId || req.query.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        })
      }

      const { period, startDate, endDate } = req.query

      const data = await dashboardService.getDashboard(companyId, {
        period,
        startDate,
        endDate
      })

      return res.status(200).json({
        success: true,
        data
      })
    } catch (error) {
      console.error('Dashboard error:', error)
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default dashboardController