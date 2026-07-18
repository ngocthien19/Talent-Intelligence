import candidateModel from '~/models/candidate/candidate.model'
import jobModel from '~/models/candidate/job/job.model'
import parseService from '~/services/parse.service'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import notificationService from '~/services/notification/notification.service'
import { comparePassword, hashPassword } from '~/utils/bcrypt'

const candidateService = {
  // Ứng tuyển công việc
  applyJob: async (data, file) => {
    const {
      user_id,
      job_id,
      name,
      email,
      phone,
      address,
      cover_letter
    } = data

    // 1. Kiểm tra công việc tồn tại
    const job = await jobModel.findById(job_id)
    if (!job) {
      throw new Error('Công việc không tồn tại')
    }

    // 2. Kiểm tra đã ứng tuyển chưa
    const hasApplied = await candidateModel.hasApplied(user_id, job_id)
    if (hasApplied) {
      throw new Error('Bạn đã ứng tuyển công việc này rồi')
    }

    // 3. Xử lý CV
    let cvText = ''
    let parsedData = null
    let cvUrl = ''
    let cvOriginalName = ''
    let cvFileSize = 0
    let cvMimeType = ''

    if (file) {
      cvText = await parseService.parseFile(file.buffer, file.mimetype)
      parsedData = parseService.extractBasicInfo(cvText)

      const uploadResult = await CloudinaryProvider.uploadBuffer(file.buffer, {
        folder: `cvs/${user_id}`,
        resource_type: 'raw',
        public_id: `${Date.now()}_${file.originalname.split('.')[0]}`
      })

      cvUrl = uploadResult.secure_url
      cvOriginalName = file.originalname
      cvFileSize = file.size
      cvMimeType = file.mimetype
    }

    // 4. Tạo candidate
    const candidate = await candidateModel.create({
      user_id,
      company_id: job.company_id,
      jd_id: job_id,
      name: name || parsedData?.name || '',
      email: email || parsedData?.email || '',
      phone: phone || parsedData?.phone || '',
      address: address || '',
      position_applied: job.title,
      cover_letter: cover_letter || '',
      source: 'website',
      cv_text: cvText,
      cv_url: cvUrl,
      cv_original_name: cvOriginalName,
      cv_file_size: cvFileSize,
      cv_mime_type: cvMimeType,
      parsed_data: parsedData,
      jd_text: job.description
    })

    // 5. Gửi thông báo cho HR
    if (job.user_id) {
      await notificationService.sendToHR(job.user_id, {
        type: 'new_application',
        title: `Ứng viên mới: ${candidate.name}`,
        content: `${candidate.name} vừa ứng tuyển vào vị trí "${job.title}"`,
        extraData: {
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobId: job_id,
          jobTitle: job.title,
          cvUrl: cvUrl,
          status: candidate.status,
          appliedAt: candidate.created_at
        }
      })
    }

    // 6. Gửi thông báo cho Candidate
    await notificationService.sendToCandidate(user_id, {
      type: 'application_submitted',
      title: 'Đã ứng tuyển thành công',
      content: `Bạn đã ứng tuyển vào vị trí "${job.title}" tại ${job.company_name || 'công ty'}`,
      extraData: {
        applicationId: candidate.id,
        jobId: job_id,
        jobTitle: job.title,
        companyName: job.company_name,
        positionApplied: job.title,
        status: candidate.status,
        appliedAt: candidate.created_at
      }
    })

    return {
      success: true,
      message: 'Ứng tuyển thành công!',
      data: candidate
    }
  },

  // Lấy danh sách ứng tuyển của candidate
  getApplications: async (userId, filters = {}) => {
    const { status } = filters

    if (status) {
      return await candidateModel.findByUserIdAndStatus(userId, status)
    }

    return await candidateModel.findByUserId(userId)
  },

  // Lấy chi tiết ứng tuyển
  getApplicationDetail: async (userId, applicationId) => {
    const application = await candidateModel.findById(applicationId, userId)
    if (!application) {
      throw new Error('Không tìm thấy ứng tuyển')
    }
    return application
  },

  // Lấy thông tin hồ sơ candidate
  getProfile: async (userId) => {
    const profile = await candidateModel.getProfile(userId)
    if (!profile) {
      throw new Error('Không tìm thấy thông tin người dùng')
    }
    return profile
  },

  // Cập nhật hồ sơ
  updateProfile: async (userId, data) => {
    const { fullname, phone, address, avatar } = data

    const updated = await candidateModel.updateProfile(userId, {
      fullname,
      phone,
      address,
      avatar
    })

    if (!updated) {
      throw new Error('Không tìm thấy người dùng')
    }

    return updated
  },

  // Upload avatar
  uploadAvatar: async (userId, file) => {
    if (!file) {
      throw new Error('Vui lòng chọn ảnh')
    }

    const avatarData = {
      secure_url: file.path,
      public_id: file.filename || file.public_id,
      format: file.mimetype?.split('/')[1] || 'jpg',
      size: file.size
    }

    const updated = await candidateModel.updateAvatar(userId, avatarData)

    return {
      avatar: avatarData,
      user: updated
    }
  },

  // Đổi mật khẩu
  changePassword: async (userId, data) => {
    const { currentPassword, newPassword } = data

    // 1. Lấy thông tin user
    const user = await candidateModel.getProfile(userId)
    if (!user) {
      throw new Error('Không tìm thấy người dùng')
    }

    // 2. Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await comparePassword(currentPassword, user.password_hash)
    if (!isPasswordValid) {
      throw new Error('Mật khẩu hiện tại không đúng')
    }

    // 3. Hash mật khẩu mới
    const hashedPassword = await hashPassword(newPassword)

    // 4. Cập nhật mật khẩu
    await candidateModel.updatePassword(userId, hashedPassword)

    return {
      success: true,
      message: 'Đổi mật khẩu thành công'
    }
  },

  // Lấy số lượng ứng tuyển
  getApplicationCount: async (userId) => {
    return await candidateModel.countApplications(userId)
  },

  // Cập nhật trạng thái ứng tuyển
  updateApplicationStatus: async (userId, applicationId, status) => {
    // Kiểm tra quyền sở hữu
    const application = await candidateModel.findById(applicationId, userId)
    if (!application) {
      throw new Error('Không tìm thấy ứng tuyển')
    }

    return await candidateModel.updateStatus(applicationId, status)
  },

  // Xóa ứng tuyển
  deleteApplication: async (userId, applicationId) => {
    // Kiểm tra quyền sở hữu
    const application = await candidateModel.findById(applicationId, userId)
    if (!application) {
      throw new Error('Không tìm thấy ứng tuyển')
    }

    // Xóa ứng tuyển (có thể soft delete hoặc hard delete)
    return await candidateModel.updateStatus(applicationId, 'rejected')
  }
}

export default candidateService