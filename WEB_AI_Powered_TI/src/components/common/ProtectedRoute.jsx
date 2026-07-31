import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROLES } from '~/utils/constant'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  // Nếu chưa đăng nhập -> redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Nếu có yêu cầu role và user không có role đó -> redirect về trang chủ
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.roleName)) {
    // Nếu user là HR nhưng vào route candidate -> redirect về HR dashboard
    if (user?.roleName === ROLES.HR) {
      return <Navigate to="/hr/dashboard" replace />
    }
    // Nếu user là Candidate nhưng vào route HR -> redirect về trang chủ
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute