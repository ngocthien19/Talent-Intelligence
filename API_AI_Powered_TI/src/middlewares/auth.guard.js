import { JwtProvider } from '~/providers/jwt.provider'
import { env } from '~/config/environment'
import { AUTH_MESSAGES } from '~/utils/constants'

const isAuthorized = (req, res, next) => {

  const accessToken = req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1]

  if (!accessToken) {
    return res.status(401).json({
      message: AUTH_MESSAGES.UNAUTHORIZED
    })
  }

  try {
    const decodedUserInfo = JwtProvider.verifyToken(accessToken, env.JWT_ACCESS_SECRET)
    req.user = {
      id: decodedUserInfo.id,
      email: decodedUserInfo.email,
      roleId: decodedUserInfo.roleId,
      roleName: decodedUserInfo.roleName
    }
    req.userId = decodedUserInfo.id
    req.jwtDecoded = decodedUserInfo
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!'
    })
  }
}

// Phân quyền
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.jwtDecoded) {
      return res.status(401).json({ message: AUTH_MESSAGES.UNAUTHORIZED })
    }

    if (!allowedRoles.includes(req.jwtDecoded.roleName)) {
      return res.status(403).json({ message: AUTH_MESSAGES.FORBIDDEN })
    }

    next()
  }
}

export const authGuard = {
  isAuthorized,
  authorize
}