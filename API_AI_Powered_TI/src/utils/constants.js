// ============================================
// VAI TRÒ (ROLES)
// ============================================
export const ROLES = {
  CANDIDATE: 'candidate',
  HR: 'hr'
}

// ============================================
// JWT
// ============================================
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh'
}

// ============================================
// OTP
// ============================================
export const OTP = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5
}

// ============================================
// THÔNG BÁO LỖI & THÀNH CÔNG
// ============================================
export const AUTH_MESSAGES = {
  // Đăng ký
  REGISTER_SUCCESS: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.',
  REGISTER_FAILED: 'Đăng ký thất bại. Vui lòng thử lại.',
  EMAIL_EXISTS: 'Email này đã được sử dụng đăng ký tài khoản khác.',

  // OTP
  OTP_SENT: 'Mã OTP đã được gửi đến email của bạn.',
  OTP_RESENT: 'Mã OTP mới đã được gửi đến email của bạn.',
  OTP_VERIFIED: 'Xác thực OTP thành công.',
  OTP_INVALID: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.',
  OTP_EXPIRED: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.',

  // Đăng nhập
  LOGIN_SUCCESS: 'Đăng nhập thành công.',
  LOGIN_FAILED: 'Email hoặc mật khẩu không chính xác.',

  // Tài khoản
  USER_NOT_FOUND: 'Tài khoản không tồn tại trên hệ thống.',
  ACCOUNT_INACTIVE: 'Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email.',
  ACCOUNT_ACTIVATED: 'Tài khoản đã được kích hoạt từ trước.',

  // Token
  TOKEN_INVALID: 'Token không hợp lệ.',
  TOKEN_EXPIRED: 'Token đã hết hạn.',
  REFRESH_TOKEN_INVALID: 'Refresh token không hợp lệ hoặc đã bị thu hồi.',
  REFRESH_TOKEN_EXPIRED: 'Refresh token đã hết hạn. Vui lòng đăng nhập lại.',

  // Quên mật khẩu
  FORGOT_PASSWORD_SUCCESS: 'Mã OTP khôi phục mật khẩu đã được gửi tới email của bạn!',
  RESET_PASSWORD_SUCCESS: 'Đặt lại mật khẩu thành công!',

  // Đăng xuất
  LOGOUT_SUCCESS: 'Đăng xuất thành công!',

  // Phân quyền
  UNAUTHORIZED: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.'
}

// ============================================
// TRẠNG THÁI NGƯỜI DÙNG
// ============================================
export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked'
}

// ============================================
// TRẠNG THÁI ỨNG VIÊN
// ============================================
export const CANDIDATE_STATUS = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  ANALYZED: 'analyzed',
  SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected'
}

// ============================================
// REGEX
// ============================================
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^0[0-9]{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
}