import authService from '~/services/auth/auth.service'
import { env } from '~/config/environment'
import ms from 'ms'
import { AUTH_MESSAGES } from '~/utils/constants'

const authController = {
  // ĐĂNG KÝ
  register: async (req, res) => {
    try {
      const result = await authService.register(req.body)
      return res.status(200).json(result)
    } catch (error) {
      if (error.message.includes('Email này đã được sử dụng')) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: `Lỗi hệ thống đăng ký: ${error.message}` })
    }
  },

  // XÁC THỰC OTP
  verifyOtp: async (req, res) => {
    try {
      const result = await authService.verifyOtp(req.body)
      return res.status(200).json(result)
    } catch (error) {
      const badRequests = [
        'không tồn tại',
        'đã được kích hoạt',
        'không chính xác',
        'đã hết hạn'
      ]

      const isBadRequest = badRequests.some(msg => error.message.includes(msg))
      if (isBadRequest) {
        return res.status(400).json({ message: error.message })
      }

      return res.status(500).json({ message: `Lỗi hệ thống xác thực OTP: ${error.message}` })
    }
  },

  // GỬI LẠI OTP
  resendOTP: async (req, res) => {
    try {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp email' })
      }

      const result = await authService.resendOTP(email)
      return res.status(200).json(result)
    } catch (error) {
      if (error.message.includes('không tồn tại') || error.message.includes('đã được kích hoạt')) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: `Lỗi hệ thống gửi lại OTP: ${error.message}` })
    }
  },

  // ĐĂNG NHẬP
  login: async (req, res) => {
    try {
      const result = await authService.login(req.body)

      const isProduction = process.env.NODE_ENV === 'production'

      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
      }

      res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: ms(env.JWT_ACCESS_EXPIRE)
      })
      res.cookie('refreshToken', result.refreshToken, {
        ...cookieOptions,
        maxAge: ms(env.JWT_REFRESH_EXPIRE)
      })

      return res.status(200).json({
        message: AUTH_MESSAGES.LOGIN_SUCCESS,
        user: result.user,
        redirectUrl: result.redirectUrl,
        accessToken: result.accessToken
      })
    } catch (error) {
      if (error.message.includes('không chính xác') || error.message.includes('chưa được kích hoạt')) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: `Lỗi hệ thống đăng nhập: ${error.message}` })
    }
  },

  //  GOOGLE LOGIN
  googleLogin: (req, res) => {
    // Passport sẽ redirect đến Google
  },

  // GOOGLE CALLBACK
  googleCallback: (req, res) => {
    try {
      const user = req.user
      const tokens = req.tokens || {
        accessToken: req.accessToken,
        refreshToken: req.refreshToken
      }

      const isProduction = process.env.NODE_ENV === 'production'
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
      }

      // Set cookies
      res.cookie('accessToken', tokens.accessToken, {
        ...cookieOptions,
        maxAge: ms(env.JWT_ACCESS_EXPIRE)
      })
      res.cookie('refreshToken', tokens.refreshToken, {
        ...cookieOptions,
        maxAge: ms(env.JWT_REFRESH_EXPIRE)
      })

      const userData = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone || null,
        address: user.address || null,
        roleId: user.roleId || user.role_id,
        roleName: user.roleName || user.role_name,
        avatar: user.avatar || null,
        isActive: user.is_active,
        companyId: user.companyId || user.company_id || null
      }

      const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173'

      const redirectUrl = `${frontendUrl}/?google_success=true&accessToken=${tokens.accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}`
      res.redirect(redirectUrl)

    } catch (error) {
      const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message)}`)
    }
  },

  // QUÊN MẬT KHẨU
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body
      if (!email) {
        return res.status(400).json({ message: 'Vui lòng cung cấp Email' })
      }

      const result = await authService.forgotPassword(email)
      return res.status(200).json(result)
    } catch (error) {
      if (error.message.includes('không tồn tại')) {
        return res.status(400).json({ message: error.message })
      }
      return res.status(500).json({ message: `Lỗi hệ thống yêu cầu OTP: ${error.message}` })
    }
  },

  // ĐẶT LẠI MẬT KHẨU
  resetPassword: async (req, res) => {
    try {
      const result = await authService.resetPassword(req.body)
      return res.status(200).json(result)
    } catch (error) {
      const badRequests = [
        'không tồn tại',
        'không chính xác',
        'đã hết hạn'
      ]

      const isBadRequest = badRequests.some(msg => error.message.includes(msg))
      if (isBadRequest) {
        return res.status(400).json({ message: error.message })
      }

      return res.status(500).json({ message: `Lỗi hệ thống đặt lại mật khẩu: ${error.message}` })
    }
  },

  // ĐĂNG XUẤT
  logout: async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh Token là bắt buộc để đăng xuất.' })
      }

      await authService.logout(refreshToken)

      const isProduction = process.env.NODE_ENV === 'production'
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
      }

      res.clearCookie('accessToken', cookieOptions)
      res.clearCookie('refreshToken', cookieOptions)

      return res.status(200).json({ message: AUTH_MESSAGES.LOGOUT_SUCCESS })
    } catch (error) {
      return res.status(500).json({ message: `Lỗi xử lý đăng xuất: ${error.message}` })
    }
  },

  // REFRESH TOKEN
  refreshAccessToken: async (req, res) => {
    try {
      const refreshToken = req.cookies?.refreshToken

      if (!refreshToken) {
        return res.status(401).json({ message: 'Không tìm thấy refresh token. Vui lòng đăng nhập lại.' })
      }

      const result = await authService.refreshAccessToken(refreshToken)

      const isProduction = process.env.NODE_ENV === 'production'
      const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/'
      }

      res.cookie('accessToken', result.accessToken, {
        ...cookieOptions,
        maxAge: ms(env.JWT_ACCESS_EXPIRE)
      })

      return res.status(200).json({
        message: 'Refresh token thành công!',
        accessToken: result.accessToken
      })
    } catch (error) {
      if (error.message.includes('không hợp lệ') ||
          error.message.includes('hết hạn') ||
          error.message.includes('bị thu hồi')) {
        const isProduction = process.env.NODE_ENV === 'production'
        const cookieOptions = {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          path: '/'
        }
        res.clearCookie('accessToken', cookieOptions)
        res.clearCookie('refreshToken', cookieOptions)

        return res.status(401).json({ message: error.message })
      }
      return res.status(500).json({ message: `Lỗi hệ thống refresh token: ${error.message}` })
    }
  }
}

export default authController