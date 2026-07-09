import jobDescriptionModel from '~/models/hr/job-description/job-description.model'

const jobDescriptionService = {
  // Tạo JD mới
  create: async (companyId, data) => {
    return await jobDescriptionModel.create({
      companyId,
      ...data
    })
  },

  // Lấy danh sách JD
  getList: async (companyId, filters) => {
    return await jobDescriptionModel.getList({
      companyId,
      ...filters
    })
  },

  // Lấy chi tiết JD
  getById: async (id, companyId) => {
    const jd = await jobDescriptionModel.getById(id, companyId)
    if (!jd) {
      throw new Error('Không tìm thấy mô tả công việc')
    }
    return jd
  },

  // Cập nhật JD
  update: async (id, companyId, data) => {
    const exists = await jobDescriptionModel.exists(id, companyId)
    if (!exists) {
      throw new Error('Không tìm thấy mô tả công việc')
    }
    return await jobDescriptionModel.update(id, companyId, data)
  },

  // Xóa JD
  delete: async (id, companyId) => {
    const result = await jobDescriptionModel.delete(id, companyId)
    if (!result) {
      throw new Error('Không tìm thấy mô tả công việc')
    }
    return result
  },

  // Lấy số lượng
  getTotalCount: async (companyId) => {
    return await jobDescriptionModel.getTotalCount(companyId)
  }
}

export default jobDescriptionService