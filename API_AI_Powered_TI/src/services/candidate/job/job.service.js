import jobModel from '~/models/candidate/job/job.model'

const jobService = {
  // Lấy danh sách công việc với filter
  getJobs: async (filters) => {
    const result = await jobModel.findAll(filters)
    return result
  },

  // Lấy chi tiết công việc
  getJobById: async (id) => {
    const job = await jobModel.findById(id)
    if (!job) {
      throw new Error('Không tìm thấy công việc này')
    }
    return job
  },

  // Lấy filter options
  getFilterOptions: async () => {
    return await jobModel.getFilterOptions()
  },

  // Lấy danh sách kỹ năng (cho autocomplete)
  getSkills: async () => {
    return await jobModel.getSkills()
  },

  // Lấy công việc theo công ty
  getJobsByCompany: async (companyId) => {
    const result = await jobModel.findByCompanyId(companyId)
    return result
  },

  // Lấy số lượng công việc đang tuyển
  getJobCount: async () => {
    return await jobModel.count()
  },

  // Lấy công việc nổi bật (gần đây)
  getFeaturedJobs: async (limit = 6) => {
    const result = await jobModel.findFeatured(limit)
    return result
  },

  // Lấy công việc liên quan
  getRelatedJobs: async (jobId, limit = 10) => {
    const jobs = await jobModel.findRelated(jobId, limit)
    return jobs
  },

  // Lấy công việc theo category
  getJobsByCategory: async (categoryId, limit = 10, page = 1) => {
    const offset = (page - 1) * limit
    const jobs = await jobModel.findByCategory(categoryId, parseInt(limit), parseInt(offset))
    return jobs
  },

  // Lấy công việc theo kỹ năng
  getJobsBySkills: async (skills, limit = 10, page = 1) => {
    const offset = (page - 1) * limit
    const jobs = await jobModel.findBySkills(skills, parseInt(limit), parseInt(offset))
    return jobs
  }
}

export default jobService