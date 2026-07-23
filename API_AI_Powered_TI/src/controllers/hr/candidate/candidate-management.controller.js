import candidateManagementService from '~/services/hr/candidate/candidate-management.service'

const candidateManagementController = {
  // Lấy danh sách ứng viên
  getCandidates: async (req, res) => {
    try {
      const companyId = req.user?.companyId
      const {
        status,
        keyword,
        minScore,
        maxScore,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        limit = 20,
        page = 1
      } = req.query

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      const offset = (page - 1) * limit

      const result = await candidateManagementService.getCandidates(companyId, {
        status,
        keyword,
        minScore: minScore ? parseFloat(minScore) : undefined,
        maxScore: maxScore ? parseFloat(maxScore) : undefined,
        startDate,
        endDate,
        sortBy,
        sortOrder,
        limit: parseInt(limit),
        offset: parseInt(offset)
      })

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy chi tiết ứng viên
  getCandidateDetail: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      const candidate = await candidateManagementService.getCandidateDetail(id, companyId)

      return res.status(200).json({
        success: true,
        data: candidate
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
  },

  // Cập nhật trạng thái (single)
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params
      const { status } = req.body

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp trạng thái'
        })
      }

      const candidate = await candidateManagementService.updateCandidateStatus(id, status)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: candidate
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Cập nhật trạng thái bulk
  updateStatusBulk: async (req, res) => {
    try {
      const { ids, status } = req.body
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp danh sách ID ứng viên'
        })
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp trạng thái'
        })
      }

      const result = await candidateManagementService.updateCandidateStatusBulk(ids, status, companyId)

      return res.status(200).json({
        success: true,
        message: `Cập nhật trạng thái thành công cho ${result.updatedCount} ứng viên`,
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa ứng viên (single)
  deleteCandidate: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      const result = await candidateManagementService.deleteCandidate(id, companyId)

      return res.status(200).json({
        success: true,
        message: 'Xóa ứng viên thành công',
        data: result
      })
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa bulk
  deleteBulk: async (req, res) => {
    try {
      const { ids } = req.body
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp danh sách ID ứng viên'
        })
      }

      const result = await candidateManagementService.deleteBulk(ids, companyId)

      return res.status(200).json({
        success: true,
        message: `Xóa thành công ${result.deletedCount} ứng viên`,
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy widgets
  getWidgets: async (req, res) => {
    try {
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      const result = await candidateManagementService.getWidgetStats(companyId)

      return res.status(200).json({
        success: true,
        data: result
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default candidateManagementController