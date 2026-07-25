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

  // Cập nhật trạng thái (single)
  updateStatus: async (id, companyId, isActive) => {
    const exists = await categoryModel.exists(id, companyId)
    if (!exists) {
      throw new Error('Không tìm thấy danh mục')
    }

    return await categoryModel.updateStatus(id, companyId, isActive)
  },

  // Cập nhật trạng thái hàng loạt (bulk)
  updateStatusBulk: async (ids, companyId, isActive) => {
    if (!ids || ids.length === 0) {
      throw new Error('Vui lòng chọn danh mục cần cập nhật')
    }

    // Kiểm tra tất cả ID có tồn tại không
    const results = await Promise.all(
      ids.map(id => categoryModel.exists(id, companyId))
    )
    const notFound = results.filter(r => !r)
    if (notFound.length > 0) {
      throw new Error(`Không tìm thấy ${notFound.length} danh mục`)
    }

    return await categoryModel.updateStatusBulk(ids, companyId, isActive)
  },

  // Xóa category (single)
  delete: async (id, companyId) => {
    const result = await categoryModel.delete(id, companyId)
    if (!result) {
      throw new Error('Không tìm thấy danh mục')
    }
    return result
  },

  // Xóa hàng loạt (bulk)
  deleteBulk: async (ids, companyId) => {
    if (!ids || ids.length === 0) {
      throw new Error('Vui lòng chọn danh mục cần xóa')
    }

    // Kiểm tra tất cả ID có tồn tại không
    const results = await Promise.all(
      ids.map(id => categoryModel.exists(id, companyId))
    )
    const notFound = results.filter(r => !r)
    if (notFound.length > 0) {
      throw new Error(`Không tìm thấy ${notFound.length} danh mục`)
    }

    return await categoryModel.deleteBulk(ids, companyId)
  },

  // Lấy thống kê
  getStats: async (companyId) => {
    return await categoryModel.getStats(companyId)
  }
}

export default categoryService