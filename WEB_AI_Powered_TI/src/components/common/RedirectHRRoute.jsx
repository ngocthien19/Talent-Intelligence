import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROLES } from '~/utils/constant'

const RedirectHRRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  if (isAuthenticated && user?.roleName === ROLES.HR) {
    return <Navigate to="/hr/dashboard" replace />
  }

  return <Outlet />
}

export default RedirectHRRoute