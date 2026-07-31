import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROLES } from '~/utils/constant'

const PublicRoute = ({ redirectTo = '/' }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  // Nếu đã đăng nhập -> redirect về trang tương ứng
  if (isAuthenticated) {
    // Nếu là HR -> redirect về HR dashboard
    if (user?.roleName === ROLES.HR) {
      return <Navigate to="/hr/dashboard" replace />
    }
    // Nếu là Candidate -> redirect về trang chủ
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export default PublicRoute