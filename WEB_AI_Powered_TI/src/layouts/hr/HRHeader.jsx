// src/layouts/hr/HRHeader.jsx - Cập nhật để dùng context
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '~/hooks/useAuth'
import { useUI } from '~/hooks/useUI'
import { useLanguage } from '~/hooks/useLanguage'
import { useSidebar } from './HRLayout'
import {
  FaBell,
  FaMoon,
  FaSun,
  FaGlobe,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa'
import { Switch } from '~/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import { getAvatarUrl, getInitials } from '~/utils/format'

const HRHeader = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useUI()
  const { language, changeLanguage, t } = useLanguage()
  const { setIsMobileOpen } = useSidebar()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const notificationRef = useRef(null)
  const dropdownRef = useRef(null)

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' }
  ]

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New candidate applied', time: '5 mins ago', read: false },
    { id: 2, title: 'Interview scheduled', time: '1 hour ago', read: false },
    { id: 3, title: 'Job posting expired', time: '3 hours ago', read: true }
  ]

  useEffect(() => {
    if (isAuthenticated) {
      const unread = notifications.filter(n => !n.read).length
      setUnreadCount(unread)
    }
  }, [isAuthenticated])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdowns on escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false)
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
    navigate('/login')
  }

  const handleMarkAllRead = () => {
    setUnreadCount(0)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(prev => !prev)
  }

  const avatarUrl = getAvatarUrl(user?.avatar)
  const userInitial = getInitials(user?.fullname)

  // Get page title with fallback
  const getPageTitle = () => {
    const path = location.pathname
    const pageMap = {
      '/hr/dashboard': t('hr.dashboard') || 'Dashboard',
      '/hr/candidates': t('hr.candidates') || 'Ứng viên',
      '/hr/jobs': t('hr.jobs') || 'Việc làm',
      '/hr/applications': t('hr.applications') || 'Đơn ứng tuyển',
      '/hr/analytics': t('hr.analytics') || 'Phân tích',
      '/hr/interviews': t('hr.interviews') || 'Lịch phỏng vấn',
      '/hr/mock-interview': t('hr.mockInterview') || 'Mock Interview',
      '/hr/search': t('hr.search') || 'Tìm kiếm ứng viên',
      '/hr/reports': t('hr.reports') || 'Báo cáo',
      '/hr/profile': t('hr.profile') || 'Hồ sơ của tôi',
      '/hr/settings': t('hr.settings') || 'Cài đặt'
    }
    return pageMap[path] || 'Dashboard'
  }

  // Format current date
  const getFormattedDate = () => {
    const date = new Date()
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (!isAuthenticated) {
    navigate('/login')
    return null
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-brand-light/50 dark:border-gray-800 shadow-sm transition-colors duration-300 flex-shrink-0">
      <div className="w-full px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left side - Page Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Mobile menu toggle */}
          <button
            className="cursor-pointer lg:hidden p-2 rounded-lg hover:bg-brand-light/50 dark:hover:bg-gray-800 transition-all duration-200 flex-shrink-0"
            onClick={toggleMobileSidebar}
            aria-label="Toggle menu"
          >
            <FaBars className="w-5 h-5 text-brand-secondary dark:text-white" />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-brand-secondary dark:text-white truncate whitespace-nowrap">
              {getPageTitle()}
            </h1>

            <p className="hidden xl:block text-xs text-brand-text/60 dark:text-gray-400 whitespace-nowrap">
              {getFormattedDate()}
            </p>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 flex-shrink-0">
          {/* Dark mode toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                className="hidden sm:flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-full bg-brand-light/30 dark:bg-gray-800 border border-brand-border/50 dark:border-gray-700 hover:bg-brand-light/60 dark:hover:bg-gray-700 transition-colors duration-300 flex-shrink-0"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <FaSun
                  size={12}
                  className={`transition-all duration-300 ${
                    !isDarkMode
                      ? 'text-yellow-500 scale-110'
                      : 'text-brand-text/40 dark:text-gray-500 scale-100'
                  }`}
                />
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                  className="cursor-pointer data-[state=checked]:bg-brand-secondary scale-75 sm:scale-100 flex-shrink-0"
                />
                <FaMoon
                  size={12}
                  className={`transition-all duration-300 ${
                    isDarkMode
                      ? 'text-blue-400 scale-110'
                      : 'text-brand-text/40 dark:text-gray-500 scale-100'
                  }`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDarkMode ? t('hr.lightMode') || 'Chế độ sáng' : t('hr.darkMode') || 'Chế độ tối'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Language switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="cursor-pointer p-1.5 sm:p-2 rounded-full hover:bg-brand-light/50 dark:hover:bg-gray-800 transition-all duration-300 flex items-center gap-0.5 focus:outline-none group flex-shrink-0"
              aria-label="Change language"
            >
              <FaGlobe
                size={16}
                className="text-brand-text dark:text-gray-300 group-hover:text-brand-primary transition-colors"
              />
              <span className="text-[10px] sm:text-xs font-semibold text-brand-text dark:text-gray-300 hidden md:inline group-hover:text-brand-primary transition-colors">
                {language.toUpperCase()}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 sm:w-40 animate-in slide-in-from-top-2 duration-200">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`cursor-pointer transition-colors duration-200 text-xs sm:text-sm ${
                    language === lang.code
                      ? 'bg-brand-light dark:bg-gray-700 text-brand-primary font-medium'
                      : ''
                  }`}
                >
                  <span className="mr-2 text-sm sm:text-base">{lang.flag}</span>
                  <span className="truncate">{lang.label}</span>
                  {language === lang.code && (
                    <span className="ml-auto text-brand-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <div ref={notificationRef} className="relative flex-shrink-0">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-1.5 sm:p-2 rounded-full hover:bg-brand-light/50 dark:hover:bg-gray-800 transition-all duration-300 focus:outline-none group cursor-pointer"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              aria-expanded={isNotificationOpen}
            >
              <FaBell
                size={16}
                className={`transition-all duration-300 ${
                  isNotificationOpen
                    ? 'text-brand-primary scale-110'
                    : 'text-brand-text dark:text-gray-300 group-hover:text-brand-primary group-hover:scale-110'
                }`}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification dropdown */}
            <div
              className={`absolute right-0 mt-2 w-[280px] sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-brand-light/50 dark:border-gray-700 overflow-hidden z-50
                transition-all duration-300 ease-out origin-top-right
                ${
    isNotificationOpen
      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
    }`}
            >
              <div className="px-3 sm:px-4 py-2.5 border-b border-brand-light/50 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <h4 className="font-semibold text-sm text-brand-secondary dark:text-white">
                  {t('hr.notifications') || 'Thông báo'}
                </h4>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer"
                  >
                    {t('hr.markAllRead') || 'Đánh dấu đã đọc'}
                  </button>
                )}
              </div>

              <div className="max-h-56 sm:max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  <ul className="py-1">
                    {notifications.map((notification) => (
                      <li key={notification.id}>
                        <button
                          className={`w-full text-left px-3 sm:px-4 py-2.5 hover:bg-brand-light/30 dark:hover:bg-gray-800 transition-colors duration-150 ${
                            !notification.read ? 'bg-brand-primary/5 dark:bg-brand-primary/10' : ''
                          }`}
                          onClick={() => {
                            setIsNotificationOpen(false)
                          }}
                        >
                          <p className="text-sm text-brand-secondary dark:text-white font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-brand-text/60 dark:text-gray-400 mt-0.5">
                            {notification.time}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center text-brand-text/70 dark:text-gray-400 text-sm flex flex-col items-center gap-2">
                    <FaBell className="text-brand-light/80 dark:text-gray-700" size={28} />
                    {t('hr.noNotifications') || 'Chưa có thông báo mới'}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-3 py-2 border-t border-brand-light/50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <button
                    className="w-full text-center text-xs text-brand-primary hover:text-brand-secondary dark:hover:text-gray-300 transition-colors duration-200 font-medium"
                    onClick={() => {
                      setIsNotificationOpen(false)
                    }}
                  >
                    {t('hr.viewAll') || 'Xem tất cả'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* User dropdown */}
          <div ref={dropdownRef} className="relative flex-shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-1.5 py-1 rounded-full hover:bg-brand-light/50 dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-brand-border/50 dark:hover:border-gray-700 focus:outline-none group cursor-pointer"
              aria-label="User menu"
              aria-expanded={isDropdownOpen}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user?.fullname || 'User'}
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-sm transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
                  {userInitial}
                </div>
              )}

              <span className="hidden sm:block text-xs sm:text-sm font-medium text-brand-secondary dark:text-white transition-colors duration-200 group-hover:text-brand-primary max-w-[50px] md:max-w-[80px] truncate">
                {user?.fullname || 'HR'}
              </span>

              {isDropdownOpen ? (
                <FaChevronUp size={10} className="text-brand-text/50 dark:text-gray-400 hidden sm:block flex-shrink-0" />
              ) : (
                <FaChevronDown size={10} className="text-brand-text/50 dark:text-gray-400 hidden sm:block group-hover:rotate-180 transition-transform duration-300 flex-shrink-0" />
              )}
            </button>

            {/* User dropdown menu */}
            <div
              className={`absolute right-0 mt-2 w-52 sm:w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-brand-light/50 dark:border-gray-700 overflow-hidden z-50
                transition-all duration-300 ease-out origin-top-right
                ${
    isDropdownOpen
      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
    }`}
            >
              <div className="px-3 sm:px-4 py-2.5 border-b border-brand-light/50 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <p className="font-semibold text-sm text-brand-secondary dark:text-white truncate">
                  {user?.fullname}
                </p>
                <p className="text-xs text-brand-text/80 dark:text-gray-400 truncate mt-0.5">
                  {user?.email}
                </p>
                <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full">
                  HR
                </span>
              </div>

              <div className="py-1.5">
                <Link
                  to="/hr/profile"
                  className="flex items-center gap-3 px-3 sm:px-4 py-2 text-sm text-brand-text dark:text-gray-300 hover:bg-brand-light/50 dark:hover:bg-gray-800 hover:text-brand-primary dark:hover:text-white transition-all duration-200 group cursor-pointer"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUser size={14} className="text-brand-text/60 dark:text-gray-500 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                  <span className="truncate">{t('hr.profile') || 'Hồ sơ của tôi'}</span>
                </Link>
                <Link
                  to="/hr/settings"
                  className="flex items-center gap-3 px-3 sm:px-4 py-2 text-sm text-brand-text dark:text-gray-300 hover:bg-brand-light/50 dark:hover:bg-gray-800 hover:text-brand-primary dark:hover:text-white transition-all duration-200 group cursor-pointer"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaCog size={14} className="text-brand-text/60 dark:text-gray-500 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                  <span className="truncate">{t('hr.settings') || 'Cài đặt'}</span>
                </Link>
                <div className="h-px bg-brand-light/50 dark:bg-gray-700 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-all duration-200 group text-left cursor-pointer"
                >
                  <FaSignOutAlt size={14} className="text-red-400 group-hover:text-red-600 transition-colors flex-shrink-0" />
                  <span className="truncate">{t('hr.logout') || 'Đăng xuất'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HRHeader