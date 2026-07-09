import bcrypt from 'bcryptjs'
import authModel from '~/models/auth/auth.model'
import { EmailProvider } from '~/providers/email.provider'
import { JwtProvider } from '~/providers/jwt.provider'
import { env } from '~/config/environment'
import { ROLES, AUTH_MESSAGES, OTP } from '~/utils/constants'
import generateOTP from '~/utils/otpGenerator'

const authService = {
  // ĐĂNG KÝ
  register: async (bodyData) => {
    const { fullname, email, password, phone, address } = bodyData

    // 1. Kiểm tra trùng lặp email
    const existingUser = await authModel.findByEmail(email)
    if (existingUser) {
      throw new Error(AUTH_MESSAGES.EMAIL_EXISTS)
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 3. Tạo OTP
    const otpCode = generateOTP()
    const otpExpiry = new Date(Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000)

    // 4. Lấy role ID (mặc định candidate)
    const roleId = await authModel.getRoleIdByName(ROLES.CANDIDATE)

    // 5. Lưu user pending
    await authModel.createPendingUser({
      fullname,
      email,
      password: hashedPassword,
      phone,
      address,
      otpCode,
      otpExpiry,
      roleId
    })

    // 6. Gửi email OTP
    const htmlContent = `
      <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eef2f5; border-radius: 12px;">
        <h2 style="color: #4a6cf7; text-align: center;">KÍCH HOẠT TÀI KHOẢN</h2>
        <h3 style="text-align: center; color: #333;">Talent Intelligence Platform</h3>
        <p>Chào <b>${fullname}</b>,</p>
        <p>Cảm ơn bạn đã đăng ký. Mã OTP để xác thực kích hoạt tài khoản của bạn là:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 5px; background: #f6f9fc; padding: 10px 25px; border-radius: 8px; border: 2px dashed #4a6cf7;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #808080; font-size: 13px;">* Mã OTP này có hiệu lực trong vòng ${OTP.EXPIRY_MINUTES} phút.</p>
        <hr style="border: none; border-top: 1px solid #eef2f5;">
        <p style="font-size: 12px; color: #aaa; text-align: center;">© ${new Date().getFullYear()} Talent Intelligence Platform</p>
      </div>
    `

    await EmailProvider.sendEmail(email, 'Mã kích hoạt tài khoản', htmlContent)

    return { message: AUTH_MESSAGES.REGISTER_SUCCESS }
  },

  // XÁC THỰC OTP
  verifyOtp: async (data) => {
    const { email, otpCode } = data

    const user = await authModel.getOtpInfo(email)
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_NOT_FOUND)
    }

    if (user.is_active === true) {
      throw new Error(AUTH_MESSAGES.ACCOUNT_ACTIVATED)
    }

    if (user.otp_hash !== otpCode) {
      throw new Error(AUTH_MESSAGES.OTP_INVALID)
    }

    const now = new Date()
    if (now > new Date(user.otp_expiry)) {
      throw new Error(AUTH_MESSAGES.OTP_EXPIRED)
    }

    await authModel.activateUser(email)

    return { message: AUTH_MESSAGES.OTP_VERIFIED }
  },

  // GỬI LẠI OTP
  resendOTP: async (email) => {
    const user = await authModel.findByEmail(email)
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_NOT_FOUND)
    }

    if (user.is_active) {
      throw new Error(AUTH_MESSAGES.ACCOUNT_ACTIVATED)
    }

    const otpCode = generateOTP()
    const otpExpiry = new Date(Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000)

    await authModel.updateForgotPasswordOtp(email, otpCode, otpExpiry)

    const htmlContent = `
      <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eef2f5; border-radius: 12px;">
        <h2 style="color: #4a6cf7; text-align: center;">MÃ OTP MỚI</h2>
        <p>Chào <b>${user.fullname}</b>,</p>
        <p>Mã OTP mới để kích hoạt tài khoản của bạn là:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 5px; background: #f6f9fc; padding: 10px 25px; border-radius: 8px; border: 2px dashed #4a6cf7;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #808080; font-size: 13px;">* Mã OTP này có hiệu lực trong vòng ${OTP.EXPIRY_MINUTES} phút.</p>
      </div>
    `

    await EmailProvider.sendEmail(email, 'Mã OTP mới', htmlContent)

    return { message: AUTH_MESSAGES.OTP_RESENT }
  },

  // ĐĂNG NHẬP
  login: async (reqBody) => {
    const { email, password } = reqBody

    const user = await authModel.getLoginUser(email)
    if (!user) {
      throw new Error(AUTH_MESSAGES.LOGIN_FAILED)
    }

    if (!user.is_active) {
      throw new Error(AUTH_MESSAGES.ACCOUNT_INACTIVE)
    }

    if (!user.password_hash) {
      throw new Error('Tài khoản này chưa có mật khẩu. Vui lòng đăng nhập bằng Google.')
    }

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      throw new Error(AUTH_MESSAGES.LOGIN_FAILED)
    }

    const userInfo = {
      id: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name
    }

    const accessToken = JwtProvider.generateToken(
      userInfo,
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_EXPIRE
    )
    const refreshToken = JwtProvider.generateToken(
      userInfo,
      env.JWT_REFRESH_SECRET,
      env.JWT_REFRESH_EXPIRE
    )

    await authModel.updateRefreshToken(user.id, refreshToken)

    let redirectUrl = '/'
    if (user.role_name === ROLES.HR) {
      redirectUrl = '/hr/dashboard'
    } else if (user.role_name === ROLES.CANDIDATE) {
      redirectUrl = '/dashboard'
    }

    return {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        roleId: user.role_id,
        roleName: user.role_name,
        avatar: user.avatar,
        isActive: user.is_active
      },
      accessToken,
      refreshToken,
      redirectUrl
    }
  },

  // GOOGLE LOGIN
  googleLogin: async (userData) => {
    const { googleId, email, fullname, avatar } = userData

    // 1. Kiểm tra user đã tồn tại với google_id chưa
    let user = await authModel.findByGoogleId(googleId)

    if (!user) {
      // 2. Kiểm tra email đã tồn tại chưa
      const existingUser = await authModel.findByEmail(email)

      if (existingUser) {
        // 3. Nếu email tồn tại, cập nhật google_id cho user đó
        user = await authModel.updateGoogleId(existingUser.id, googleId)
      } else {
        // 4. Tạo user mới
        const roleId = await authModel.getRoleIdByName(ROLES.CANDIDATE)

        const avatarData = avatar ? {
          secure_url: avatar,
          public_id: `google_${googleId}`,
          format: 'jpg'
        } : null

        user = await authModel.createGoogleUser({
          email,
          fullname,
          googleId,
          avatar: avatarData,
          roleId,
          isActive: true
        })
      }
    }

    // 5. Tạo token
    const userInfo = {
      id: user.id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.role_name
    }

    const accessToken = JwtProvider.generateToken(
      userInfo,
      env.JWT_ACCESS_SECRET,
      env.JWT_ACCESS_EXPIRE
    )
    const refreshToken = JwtProvider.generateToken(
      userInfo,
      env.JWT_REFRESH_SECRET,
      env.JWT_REFRESH_EXPIRE
    )

    // 6. Lưu refresh token
    await authModel.updateRefreshToken(user.id, refreshToken)

    // 7. Cập nhật last login
    await authModel.updateLastLogin(user.id)

    return {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        roleId: user.role_id,
        roleName: user.role_name,
        avatar: user.avatar,
        isActive: user.is_active
      },
      tokens: {
        accessToken,
        refreshToken
      }
    }
  },

  //  GET USER BY ID
  getUserById: async (userId) => {
    const user = await authModel.getLoginUserById(userId)
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_NOT_FOUND)
    }
    return user
  },

  // QUÊN MẬT KHẨU
  forgotPassword: async (email) => {
    const user = await authModel.findByEmail(email)
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_NOT_FOUND)
    }

    const otpCode = generateOTP()
    const otpExpiry = new Date(Date.now() + OTP.EXPIRY_MINUTES * 60 * 1000)

    await authModel.updateForgotPasswordOtp(email, otpCode, otpExpiry)

    const htmlContent = `
      <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eef2f5; border-radius: 12px;">
        <h2 style="color: #4a6cf7; text-align: center;">KHÔI PHỤC MẬT KHẨU</h2>
        <p>Chào <b>${user.fullname}</b>,</p>
        <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #1a1a1a; letter-spacing: 5px; background: #f6f9fc; padding: 10px 25px; border-radius: 8px; border: 2px dashed #4a6cf7;">
            ${otpCode}
          </span>
        </div>
        <p style="color: #808080; font-size: 13px;">* Mã OTP này có hiệu lực trong vòng ${OTP.EXPIRY_MINUTES} phút.</p>
        <p>Nếu không phải bạn yêu cầu, vui lòng bỏ qua email này.</p>
      </div>
    `

    await EmailProvider.sendEmail(email, 'Mã OTP khôi phục mật khẩu', htmlContent)

    return { message: AUTH_MESSAGES.FORGOT_PASSWORD_SUCCESS }
  },

  // ĐẶT LẠI MẬT KHẨU
  resetPassword: async (data) => {
    const { email, otpCode, password } = data

    const user = await authModel.getOtpInfo(email)
    if (!user) {
      throw new Error(AUTH_MESSAGES.USER_NOT_FOUND)
    }

    if (user.otp_hash !== otpCode) {
      throw new Error('Mã OTP khôi phục mật khẩu không chính xác')
    }

    const now = new Date()
    if (now > new Date(user.otp_expiry)) {
      throw new Error(AUTH_MESSAGES.OTP_EXPIRED)
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    await authModel.updateNewPassword(email, hashedPassword)

    return { message: AUTH_MESSAGES.RESET_PASSWORD_SUCCESS }
  },

  // ĐĂNG XUẤT
  logout: async (refreshToken) => {
    await authModel.removeRefreshToken(refreshToken)
  },

  // REFRESH TOKEN
  refreshAccessToken: async (refreshToken) => {
    try {
      const decoded = JwtProvider.verifyToken(refreshToken, env.JWT_REFRESH_SECRET)

      if (!decoded || !decoded.id) {
        throw new Error(AUTH_MESSAGES.REFRESH_TOKEN_INVALID)
      }

      const user = await authModel.getLoginUserById(decoded.id)
      if (!user) {
        throw new Error(AUTH_MESSAGES.USER_NOT_FOUND)
      }

      const isValid = await authModel.verifyRefreshToken(decoded.id, refreshToken)
      if (!isValid) {
        throw new Error(AUTH_MESSAGES.REFRESH_TOKEN_INVALID)
      }

      const userInfo = {
        id: user.id,
        email: user.email,
        roleId: user.role_id,
        roleName: user.role_name
      }

      const newAccessToken = JwtProvider.generateToken(
        userInfo,
        env.JWT_ACCESS_SECRET,
        env.JWT_ACCESS_EXPIRE
      )

      return { accessToken: newAccessToken }
    } catch (error) {
      if (error.message.includes('jwt expired')) {
        throw new Error(AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED)
      }
      if (error.message.includes('invalid token')) {
        throw new Error(AUTH_MESSAGES.REFRESH_TOKEN_INVALID)
      }
      throw error
    }
  }
}

export default authService