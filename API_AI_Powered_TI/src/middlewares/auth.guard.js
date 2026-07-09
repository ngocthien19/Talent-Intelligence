import { JwtProvider } from '~/providers/jwt.provider.js'
import { env } from '~/config/environment.js'
import { AUTH_MESSAGES } from '~/utils/constants.js'

const isAuthorized = (req, res, next) => {
  const accessToken = req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1]

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: AUTH_MESSAGES.UNAUTHORIZED
    })
  }

  try {
    const decodedUserInfo = JwtProvider.verifyToken(accessToken, env.JWT_ACCESS_SECRET)

    req.user = {
      id: decodedUserInfo.id,
      email: decodedUserInfo.email,
      roleId: decodedUserInfo.roleId,
      roleName: decodedUserInfo.roleName,
      companyId: decodedUserInfo.companyId || decodedUserInfo.company_id
    }
    req.userId = decodedUserInfo.id
    req.jwtDecoded = decodedUserInfo
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!'
    })
  }
}

// Phân quyền
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.jwtDecoded) {
      return res.status(401).json({
        success: false,
        message: AUTH_MESSAGES.UNAUTHORIZED
      })
    }

    if (!allowedRoles.includes(req.jwtDecoded.roleName)) {
      return res.status(403).json({
        success: false,
        message: AUTH_MESSAGES.FORBIDDEN
      })
    }

    next()
  }
}

export const authGuard = {
  isAuthorized,
  authorize
}