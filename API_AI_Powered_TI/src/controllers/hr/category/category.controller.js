import categoryService from '~/services/hr/category/category.service'

const categoryController = {
  create: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const data = req.body

      const result = await categoryService.create(companyId, data)

      return res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  getList: async (req, res) => {
    try {
      const companyId = req.user.companyId
      const {
        isActive,
        keyword,
        limit = 20,
        page = 1
      } = req.query

      const offset = (page - 1) * limit

      const result = await categoryService.getList(companyId, {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        keyword,
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

  getDropdown: async (req, res) => {
    try {
      const companyId = req.user?.companyId

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy company ID'
        })
      }

      const result = await categoryService.getDropdown(companyId)

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
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user.companyId

      const result = await categoryService.getById(id, companyId)

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

  update: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user.companyId
      const data = req.body

      const result = await categoryService.update(id, companyId, data)

      return res.status(200).json({
        success: true,
        message: 'Cập nhật danh mục thành công',
        data: result
      })
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params
      const companyId = req.user.companyId

      const result = await categoryService.delete(id, companyId)

      return res.status(200).json({
        success: true,
        message: 'Xóa danh mục thành công',
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

export default categoryController