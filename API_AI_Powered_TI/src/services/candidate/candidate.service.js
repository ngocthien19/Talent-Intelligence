import candidateProfileModel from '~/models/candidate/candidate-profile.model'
import applicationModel from '~/models/candidate/application.model'
import jobModel from '~/models/candidate/job/job.model'
import userModel from '~/models/user.model' // THÊM IMPORT
import parseService from '~/services/parse.service'
import { CloudinaryProvider } from '~/providers/cloudinary.provider'
import notificationService from '~/services/notification/notification.service'
import { comparePassword, hashPassword } from '~/utils/bcrypt'

const candidateService = {
  // Đảm bảo profile tồn tại - SỬA: dùng userModel
  ensureProfileExists: async (userId) => {
    // Lấy thông tin user từ userModel
    const user = await userModel.findById(userId)
    if (!user) {
      throw new Error('Không tìm thấy người dùng')
    }
    return await candidateProfileModel.getOrCreate(userId, user)
  },

  // Apply job
  applyJob: async (userId, data, file) => {
    const { job_id, cover_letter } = data

    // 1. Đảm bảo profile tồn tại
    const profile = await candidateService.ensureProfileExists(userId)

    // 2. Kiểm tra công việc
    const job = await jobModel.findById(job_id)
    if (!job) {
      throw new Error('Công việc không tồn tại')
    }

    // 3. Kiểm tra đã ứng tuyển chưa
    const hasApplied = await applicationModel.hasApplied(profile.id, job_id)
    if (hasApplied) {
      throw new Error('Bạn đã ứng tuyển công việc này rồi')
    }

    // 4. Xử lý CV
    let cvUrl = ''
    let cvText = ''
    let parsedData = null
    let cvOriginalName = ''
    let cvFileSize = 0
    let cvMimeType = ''

    if (file) {
      cvText = await parseService.parseFile(file.buffer, file.mimetype)
      parsedData = parseService.extractBasicInfo(cvText)

      const uploadResult = await CloudinaryProvider.uploadBuffer(file.buffer, {
        folder: `cvs/${userId}`,
        resource_type: 'raw',
        public_id: `${Date.now()}_${file.originalname.split('.')[0]}`
      })

      cvUrl = uploadResult.secure_url
      cvOriginalName = file.originalname
      cvFileSize = file.size
      cvMimeType = file.mimetype

      // Cập nhật CV vào profile
      await candidateProfileModel.update(profile.id, {
        cv_text: cvText,
        cv_url: cvUrl,
        cv_original_name: cvOriginalName,
        cv_file_size: cvFileSize,
        cv_mime_type: cvMimeType,
        parsed_data: parsedData
      })
    }

    // 5. Tạo application mới
    const application = await applicationModel.create({
      candidate_profile_id: profile.id,
      company_id: job.company_id,
      job_description_id: job_id,
      position: job.title,
      cover_letter_text: cover_letter || '',
      source: 'website',
      jd_text: job.description
    })

    // 6. Gửi thông báo
    if (job.user_id) {
      await notificationService.sendToHR(job.user_id, {
        type: 'new_application',
        title: `Ứng viên mới: ${profile.name}`,
        content: `${profile.name} vừa ứng tuyển vào vị trí "${job.title}"`,
        extraData: {
          applicationId: application.id,
          candidateName: profile.name,
          candidateEmail: profile.email,
          jobId: job_id,
          jobTitle: job.title,
          cvUrl: cvUrl,
          status: application.status,
          appliedAt: application.created_at
        }
      })
    }

    await notificationService.sendToCandidate(userId, {
      type: 'application_submitted',
      title: 'Đã ứng tuyển thành công',
      content: `Bạn đã ứng tuyển vào vị trí "${job.title}" tại ${job.company_name || 'công ty'}`,
      extraData: {
        applicationId: application.id,
        jobId: job_id,
        jobTitle: job.title,
        companyName: job.company_name,
        status: application.status,
        appliedAt: application.created_at
      }
    })

    return {
      success: true,
      message: 'Ứng tuyển thành công!',
      data: application
    }
  },

  // Lấy danh sách ứng tuyển
  getApplications: async (userId, filters = {}) => {
    const profile = await candidateService.ensureProfileExists(userId)
    return await applicationModel.findByCandidateProfileId(profile.id, filters)
  },

  // Lấy chi tiết ứng tuyển
  getApplicationDetail: async (userId, applicationId) => {
    const profile = await candidateService.ensureProfileExists(userId)
    const application = await applicationModel.findById(applicationId, profile.id)
    if (!application) {
      throw new Error('Không tìm thấy ứng tuyển')
    }
    return application
  },

  // Lấy thông tin hồ sơ
  getProfile: async (userId) => {
    const profile = await candidateService.ensureProfileExists(userId)

    // Lấy user để có avatar nếu profile chưa có
    const user = await userModel.findById(userId)

    // Ưu tiên avatar từ profile, nếu không có thì lấy từ user
    const avatar = profile.avatar || user?.avatar || null

    return {
      id: profile.id,
      user_id: profile.user_id,
      fullname: profile.name || user?.fullname || '',
      email: profile.email || user?.email || '',
      phone: profile.phone || user?.phone || '',
      address: profile.address || user?.address || '',
      avatar: avatar,
      cv_text: profile.cv_text,
      cv_url: profile.cv_url,
      cv_original_name: profile.cv_original_name,
      cv_file_size: profile.cv_file_size,
      cv_mime_type: profile.cv_mime_type,
      parsed_data: profile.parsed_data,
      skills: profile.skills,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    }
  },

  // Cập nhật hồ sơ
  updateProfile: async (userId, data) => {
    const profile = await candidateService.ensureProfileExists(userId)
    return await candidateProfileModel.update(profile.id, {
      name: data.fullname,
      phone: data.phone,
      address: data.address
    })
  },

  // Upload avatar
  uploadAvatar: async (userId, file) => {
    if (!file) {
      throw new Error('Vui lòng chọn ảnh')
    }

    const profile = await candidateService.ensureProfileExists(userId)
    const avatarData = {
      secure_url: file.path,
      public_id: file.filename || file.public_id,
      format: file.mimetype?.split('/')[1] || 'jpg',
      size: file.size
    }

    return await candidateProfileModel.update(profile.id, { avatar: avatarData })
  },

  // Đổi mật khẩu - SỬA: dùng userModel
  changePassword: async (userId, data) => {
    const { currentPassword, newPassword } = data
    const user = await userModel.findById(userId)
    if (!user) {
      throw new Error('Không tìm thấy người dùng')
    }

    // Kiểm tra user có password_hash không (không phải login Google)
    if (!user.password_hash) {
      throw new Error('Tài khoản này đăng nhập bằng Google, không thể đổi mật khẩu')
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password_hash)
    if (!isPasswordValid) {
      throw new Error('Mật khẩu hiện tại không đúng')
    }

    const hashedPassword = await hashPassword(newPassword)
    await userModel.updatePassword(userId, hashedPassword)

    return { success: true, message: 'Đổi mật khẩu thành công' }
  },

  // Lấy số lượng ứng tuyển
  getApplicationCount: async (userId) => {
    const profile = await candidateService.ensureProfileExists(userId)
    return await applicationModel.countByCandidateProfileId(profile.id)
  }
}

export default candidateService