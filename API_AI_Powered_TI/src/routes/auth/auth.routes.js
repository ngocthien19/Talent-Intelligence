import express from 'express'
import authController from '~/controllers/auth/auth.controller'
import { authMiddleware } from '~/middlewares/auth.middleware'
import passport from 'passport'

const router = express.Router()

// Đăng ký
router.post(
  '/register',
  authMiddleware.registerLimiter,
  authMiddleware.validateRegister,
  authController.register
)

// Xác thực OTP
router.post(
  '/verify-otp',
  authMiddleware.validateVerifyOtp,
  authController.verifyOtp
)

// Gửi lại OTP
router.post(
  '/resend-otp',
  authMiddleware.resendOTPLimiter,
  authController.resendOTP
)

// Đăng nhập
router.post(
  '/login',
  authMiddleware.loginLimiter,
  authMiddleware.validateLogin,
  authController.login
)

// Quên mật khẩu
router.post(
  '/forgot-password',
  authMiddleware.registerLimiter,
  authController.forgotPassword
)

// Đặt lại mật khẩu
router.post(
  '/reset-password',
  authMiddleware.validateResetPassword,
  authController.resetPassword
)

// Refresh token
router.post(
  '/refresh-token',
  authController.refreshAccessToken
)

// Đăng xuất
router.post(
  '/logout',
  authController.logout
)

// Route bắt đầu đăng nhập Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
)

// Route callback sau khi Google xác thực
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  authController.googleCallback
)

export default router