import categoryService from '~/services/candidate/category/category.service'

const categoryController = {
  // Lấy tất cả category (cho candidate)
  getAllCategories: async (req, res) => {
    try {
      const categories = await categoryService.getAllCategories()

      return res.status(200).json({
        success: true,
        data: categories
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy category theo slug
  getCategoryBySlug: async (req, res) => {
    try {
      const { slug } = req.params
      const category = await categoryService.getCategoryBySlug(slug)

      return res.status(200).json({
        success: true,
        data: category
      })
    } catch (error) {
      if (error.message === 'Không tìm thấy danh mục') {
        return res.status(404).json({
          success: false,
          message: error.message
        })
      }
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy category theo ID
  getCategoryById: async (req, res) => {
    try {
      const { id } = req.params
      const category = await categoryService.getCategoryById(id)

      return res.status(200).json({
        success: true,
        data: category
      })
    } catch (error) {
      if (error.message === 'Không tìm thấy danh mục') {
        return res.status(404).json({
          success: false,
          message: error.message
        })
      }
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default categoryController