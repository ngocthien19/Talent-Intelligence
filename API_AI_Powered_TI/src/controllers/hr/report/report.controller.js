import reportService from '~/services/hr/report/report.service'

const reportController = {
  //Gửi báo cáo cho ứng viên
  sendReport: async (req, res) => {
    try {
      const { id } = req.params
      const hrId = req.user.id

      const result = await reportService.sendReport(id, hrId)

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

  // Kiểm tra đã gửi báo cáo chưa
  checkSent: async (req, res) => {
    try {
      const { id } = req.params
      const result = await reportService.checkSent(id)

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

export default reportController