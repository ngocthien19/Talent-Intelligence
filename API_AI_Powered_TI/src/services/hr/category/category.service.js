import categoryModel from '~/models/hr/category/category.model'

const categoryService = {
  create: async (companyId, data) => {
    const { name } = data

    const exists = await categoryModel.existsByName(name, companyId)
    if (exists) {
      throw new Error('Tên danh mục đã tồn tại')
    }

    return await categoryModel.create({
      companyId,
      ...data
    })
  },

  getList: async (companyId, filters) => {
    return await categoryModel.getList({
      companyId,
      ...filters
    })
  },

  getById: async (id, companyId) => {
    const category = await categoryModel.getById(id, companyId)
    if (!category) {
      throw new Error('Không tìm thấy danh mục')
    }
    return category
  },

  getDropdown: async (companyId) => {
    return await categoryModel.getDropdown(companyId)
  },

  update: async (id, companyId, data) => {
    const exists = await categoryModel.exists(id, companyId)
    if (!exists) {
      throw new Error('Không tìm thấy danh mục')
    }

    if (data.name) {
      const nameExists = await categoryModel.existsByName(data.name, companyId, id)
      if (nameExists) {
        throw new Error('Tên danh mục đã tồn tại')
      }
    }

    return await categoryModel.update(id, companyId, data)
  },

  delete: async (id, companyId) => {
    const result = await categoryModel.delete(id, companyId)
    if (!result) {
      throw new Error('Không tìm thấy danh mục')
    }
    return result
  }
}

export default categoryService