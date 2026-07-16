import categoryModel from '~/models/candidate/category/category.model'

const categoryService = {
  // Lấy tất cả category
  getAllCategories: async () => {
    return await categoryModel.getAllCategories()
  },

  // Lấy category theo slug
  getCategoryBySlug: async (slug) => {
    const category = await categoryModel.getCategoryBySlug(slug)
    if (!category) {
      throw new Error('Không tìm thấy danh mục')
    }
    return category
  },

  // Lấy category theo ID
  getCategoryById: async (id) => {
    const category = await categoryModel.getCategoryById(id)
    if (!category) {
      throw new Error('Không tìm thấy danh mục')
    }
    return category
  }
}

export default categoryService