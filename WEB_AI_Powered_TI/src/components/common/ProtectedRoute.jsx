import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaSpinner } from 'react-icons/fa'
import { ROLES } from '~/utils/constant'

const ProtectedRoute = ({ allowedRoles }) => {
  const location = useLocation()
  const { isAuthenticated, isInitialized, user } = useSelector((state) => state.auth)

  // Chưa kiểm tra xong đăng nhập -> hiện loading, KHÔNG redirect vội
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-950">
        <FaSpinner className="animate-spin text-brand-primary" size={32} />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Lưu lại nơi người dùng định vào để sau khi login có thể quay lại (tuỳ chọn)
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user?.roleName)) {
    // Đã đăng nhập nhưng sai role -> đưa về trang chủ thay vì trang login
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute