import jobService from '~/services/candidate/job/job.service'

const jobController = {
  // Lấy danh sách công việc
  getJobs: async (req, res) => {
    try {
      const filters = {
        keyword: req.query.keyword,
        location: req.query.location,
        experience_level: req.query.experience_level,
        employment_type: req.query.employment_type,
        skill: req.query.skill,
        min_salary: req.query.min_salary,
        max_salary: req.query.max_salary,
        category_id: req.query.category_id,
        limit: parseInt(req.query.limit) || 10,
        offset: parseInt(req.query.offset) || 0
      }

      const result = await jobService.getJobs(filters)

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

  // Lấy chi tiết công việc
  getJobDetail: async (req, res) => {
    try {
      const { id } = req.params
      const job = await jobService.getJobById(id)

      return res.status(200).json({
        success: true,
        data: job
      })
    } catch (error) {
      if (error.message === 'Không tìm thấy công việc này') {
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

  // Lấy filter options
  getFilterOptions: async (req, res) => {
    try {
      const options = await jobService.getFilterOptions()

      return res.status(200).json({
        success: true,
        data: options
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy danh sách kỹ năng
  getSkills: async (req, res) => {
    try {
      const skills = await jobService.getSkills()

      return res.status(200).json({
        success: true,
        data: skills
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy công việc theo công ty
  getJobsByCompany: async (req, res) => {
    try {
      const { companyId } = req.params
      const jobs = await jobService.getJobsByCompany(companyId)

      return res.status(200).json({
        success: true,
        data: jobs
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy công việc nổi bật
  getFeaturedJobs: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 6
      const jobs = await jobService.getFeaturedJobs(limit)

      return res.status(200).json({
        success: true,
        data: jobs
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  },

  // Lấy số lượng công việc
  getJobCount: async (req, res) => {
    try {
      const count = await jobService.getJobCount()

      return res.status(200).json({
        success: true,
        data: { total: count }
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }
}

export default jobController