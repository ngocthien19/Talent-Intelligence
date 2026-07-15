import jobDescriptionService from '~/services/hr/job-description/job-description.service'

const jobDescriptionController = {
  // Tạo JD mới
  create: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const data = req.body

      const result = await jobDescriptionService.create(companyId, data)

      return res.status(201).json({
        success: true,
        message: 'Tạo mô tả công việc thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách JD
  getList: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const {
        keyword,
        experienceLevel,
        employmentType,
        isActive,
        sortBy,
        sortOrder,
        limit = 20,
        page = 1
      } = req.query

      const offset = (page - 1) * limit

      const result = await jobDescriptionService.getList(companyId, {
        keyword,
        experienceLevel,
        employmentType,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
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

  // Lấy chi tiết JD
  getById: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user.companyId

      const result = await jobDescriptionService.getById(id, companyId)

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

  // Cập nhật JD
  update: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user.companyId
      const data = req.body

      const result = await jobDescriptionService.update(id, companyId, data)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật mô tả công việc thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  // Xóa JD
  delete: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user.companyId

      const result = await jobDescriptionService.delete(id, companyId)

      return res.status(200).json({
        success: true,
        message: 'Xóa mô tả công việc thành công',
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

export default jobDescriptionController