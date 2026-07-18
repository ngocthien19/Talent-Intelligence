import candidateService from '~/services/candidate/candidate.service'

export const ensureCandidate = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next()
    }

    // Đảm bảo candidate profile tồn tại
    const profile = await candidateService.ensureProfileExists(req.user.id)

    // Lưu profile vào req để sử dụng sau
    req.candidateProfile = profile

    next()
  } catch (error) {
    // Nếu lỗi, vẫn cho phép request tiếp tục nhưng log lỗi
    // Tránh làm gián đoạn request
    next()
  }
}

export const ensureCandidateRequired = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập'
      })
    }

    // Đảm bảo candidate profile tồn tại
    const profile = await candidateService.ensureProfileExists(req.user.id)

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ ứng viên. Vui lòng tạo hồ sơ trước.'
      })
    }

    // Lưu profile vào req để sử dụng sau
    req.candidateProfile = profile

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra hồ sơ ứng viên: ' + error.message
    })
  }
}

export const getCandidateProfile = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      req.candidateProfile = null
      return next()
    }

    // Lấy profile nhưng không tạo mới
    const { candidateProfileModel } = await import('~/models/candidate/candidate-profile.model')
    const profile = await candidateProfileModel.findByUserId(req.user.id)

    req.candidateProfile = profile || null

    next()
  } catch (error) {
    req.candidateProfile = null
    next()
  }
}