import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '~/hooks/useAuth'
import { useUI } from '~/hooks/useUI'
import { useLanguage } from '~/hooks/useLanguage'
import { useSidebar } from './HRLayout'
import {
  FaHome,
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaChartBar,
  FaCalendarAlt,
  FaSearch,
  FaFileInvoice,
  FaUserCog,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaMoon,
  FaSun
} from 'react-icons/fa'
import { Switch } from '~/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { getAvatarUrl, getInitials } from '~/utils/format'

const HRSidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useUI()
  const { t } = useLanguage()

  // Lấy state từ context
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar()

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const menuItems = [
    { path: '/hr/dashboard', icon: FaHome, label: 'hr.dashboard', defaultLabel: 'Dashboard' },
    { path: '/hr/candidates', icon: FaUsers, label: 'hr.candidates', defaultLabel: 'Ứng viên' },
    { path: '/hr/jobs', icon: FaBriefcase, label: 'hr.jobs', defaultLabel: 'Việc làm' },
    { path: '/hr/applications', icon: FaFileAlt, label: 'hr.applications', defaultLabel: 'Đơn ứng tuyển' },
    { path: '/hr/interviews', icon: FaCalendarAlt, label: 'hr.interviews', defaultLabel: 'Lịch phỏng vấn' },
    { path: '/hr/mock-interview', icon: FaUserCog, label: 'hr.mockInterview', defaultLabel: 'Mock Interview' },
    { path: '/hr/search', icon: FaSearch, label: 'hr.search', defaultLabel: 'Tìm kiếm' },
    { path: '/hr/analytics', icon: FaChartBar, label: 'hr.analytics', defaultLabel: 'Phân tích' },
    { path: '/hr/reports', icon: FaFileInvoice, label: 'hr.reports', defaultLabel: 'Báo cáo' }
  ]

  // Listen for toggle event from header
  useEffect(() => {
    const handleToggleSidebar = () => {
      setIsMobileOpen(prev => !prev)
    }
    window.addEventListener('toggleSidebar', handleToggleSidebar)
    return () => window.removeEventListener('toggleSidebar', handleToggleSidebar)
  }, [setIsMobileOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location.pathname, setIsMobileOpen])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setIsMobileOpen])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const avatarUrl = getAvatarUrl(user?.avatar)
  const userInitial = getInitials(user?.fullname)

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden cursor-pointer"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-900 
          border-r border-brand-light/50 dark:border-gray-800
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-brand-light/50 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              HR
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold text-brand-secondary dark:text-white truncate">
                HR Dashboard
              </span>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-full hover:bg-brand-light/50 dark:hover:bg-gray-800 transition-colors flex-shrink-0 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 text-brand-text/60 dark:text-gray-400 transition-transform duration-300 ${
                isCollapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              const label = t(item.label) || item.defaultLabel

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive: navActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 cursor-pointer
                      ${isActive || navActive
                  ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-light'
                  : 'text-brand-text/70 dark:text-gray-400 hover:bg-brand-light/50 dark:hover:bg-gray-800 hover:text-brand-secondary dark:hover:text-white'
                }
                      ${isCollapsed ? 'justify-center' : ''}
                      group relative
                    `}
                  >
                    <Icon
                      size={20}
                      className={`flex-shrink-0 ${
                        isActive ? 'text-brand-primary' : ''
                      } group-hover:scale-110 transition-transform duration-200`}
                    />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">{label}</span>
                    )}
                    {isCollapsed && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="absolute inset-0 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom section - Dark mode (mobile only), User profile & Logout */}
        <div className="border-t border-brand-light/50 dark:border-gray-800 p-3 flex-shrink-0">
          {/* Dark mode toggle - Chỉ hiển thị trên mobile */}
          <div className="lg:hidden mb-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  className={`
                    flex items-center gap-2 px-2 py-1.5 rounded-lg w-full justify-center
                    bg-brand-light/30 dark:bg-gray-800
                    hover:bg-brand-light/60 dark:hover:bg-gray-700
                    transition-all duration-300 cursor-pointer
                  `}
                >
                  <FaSun
                    size={14}
                    className={`transition-all ${
                      !isDarkMode ? 'text-yellow-500' : 'text-brand-text/40 dark:text-gray-500'
                    }`}
                  />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                    className="cursor-pointer data-[state=checked]:bg-brand-secondary scale-75"
                  />
                  <FaMoon
                    size={14}
                    className={`transition-all ${
                      isDarkMode ? 'text-blue-400' : 'text-brand-text/40 dark:text-gray-500'
                    }`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* User profile */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`
                w-full flex items-center gap-3 px-2 py-2 rounded-lg
                hover:bg-brand-light/50 dark:hover:bg-gray-800
                transition-all duration-200 group cursor-pointer
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.fullname || 'User'}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700 flex-shrink-0"
                  onError={(e) => (e.target.style.display = 'none')}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {userInitial}
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
                    {user?.fullname || 'HR'}
                  </p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
              {!isCollapsed && (
                <div className="flex-shrink-0">
                  {isUserMenuOpen ? (
                    <FaChevronUp size={12} className="text-brand-text/50 dark:text-gray-400" />
                  ) : (
                    <FaChevronDown size={12} className="text-brand-text/50 dark:text-gray-400" />
                  )}
                </div>
              )}
            </button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div
                className={`
                  absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-gray-900
                  rounded-lg shadow-xl border border-brand-light/50 dark:border-gray-700
                  overflow-hidden z-50
                  ${isCollapsed ? 'min-w-[200px] left-1/2 -translate-x-1/2' : ''}
                `}
              >
                <div className="px-3 py-2 border-b border-brand-light/50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <p className="font-medium text-sm text-brand-secondary dark:text-white truncate">
                    {user?.fullname}
                  </p>
                  <p className="text-xs text-brand-text/80 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="py-1">
                  <NavLink
                    to="/hr/profile"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-brand-text dark:text-gray-300 hover:bg-brand-light dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FaUser size={14} />
                    {t('hr.profile') || 'Hồ sơ'}
                  </NavLink>
                  <NavLink
                    to="/hr/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-brand-text dark:text-gray-300 hover:bg-brand-light dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FaCog size={14} />
                    {t('hr.settings') || 'Cài đặt'}
                  </NavLink>
                  <div className="h-px bg-brand-light/50 dark:bg-gray-700 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-all duration-200 cursor-pointer"
                  >
                    <FaSignOutAlt size={14} />
                    {t('hr.logout') || 'Đăng xuất'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Logout button - Hiển thị ở tất cả các màn hình */}
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
              title={t('hr.logout') || 'Đăng xuất'}
            >
              <FaSignOutAlt size={20} />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer border border-red-200 dark:border-red-900/50"
            >
              <FaSignOutAlt size={16} />
              <span className="text-sm font-medium">{t('hr.logout') || 'Đăng xuất'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  )
}

export default HRSidebar