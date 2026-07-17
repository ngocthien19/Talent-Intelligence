import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FaHome,
  FaBriefcase,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartBar,
  FaBell,
  FaMoon,
  FaSun,
  FaGlobe,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa'
import { useAuth } from '~/hooks/useAuth'
import { useUI } from '~/hooks/useUI'
import { useLanguage } from '~/hooks/useLanguage'
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

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useUI()
  const { language, changeLanguage, t } = useLanguage()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationRef = useRef(null)

  const languages = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' }
  ]

  useEffect(() => {
    if (isAuthenticated) {
      setUnreadCount(3)
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setIsDropdownOpen(false)
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const navLinks = [
    { to: '/', label: t('header.home') || 'Trang chủ', icon: FaHome },
    { to: '/jobs', label: t('header.jobs') || 'Việc làm', icon: FaBriefcase },
    { to: '/applications', label: t('header.applications') || 'Hồ sơ đã ứng tuyển', icon: FaFileAlt }
  ]

  const avatarUrl = getAvatarUrl(user?.avatar)
  const userInitial = getInitials(user?.fullname)

  return (
    <header className="bg-white dark:bg-gray-900 shadow-custom sticky top-0 z-50 transition-colors duration-300 ease-in-out">
      <div className="app-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - JobMind */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-10 h-10 bg-gradient-brand rounded-lg flex items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-105 shadow-md">
              <span className="text-white font-bold text-xl">JM</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-brand-secondary dark:text-white transition-colors duration-300">
                Job<span className="text-brand-primary">Mind</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(link.to)
                    ? 'text-brand-primary bg-brand-light/70 dark:bg-brand-primary/20 dark:text-brand-primary font-semibold'
                    : 'text-brand-text dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary hover:bg-brand-light/50 dark:hover:bg-gray-800'
                }`}
              >
                <link.icon size={18} />
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Dark mode toggle via Switch */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full bg-brand-light/30 dark:bg-gray-800 border border-brand-border/50 dark:border-gray-700 hover:bg-brand-light/60 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out">
                  <FaSun
                    size={16}
                    className={`transition-all duration-300 ${!isDarkMode ? 'text-yellow-500 scale-110' : 'text-brand-text/40 dark:text-gray-500 scale-100'}`}
                  />
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                    className="cursor-pointer data-[state=checked]:bg-brand-secondary"
                  />
                  <FaMoon
                    size={14}
                    className={`transition-all duration-300 ${isDarkMode ? 'text-blue-400 scale-110' : 'text-brand-text/40 dark:text-gray-500 scale-100'}`}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isDarkMode ? t('header.lightMode') || 'Chế độ sáng' : t('header.darkMode') || 'Chế độ tối'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Language switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer p-2 rounded-full hover:bg-brand-light dark:hover:bg-gray-800 transition-all duration-300 ease-in-out flex items-center gap-1.5 focus:outline-none group">
                <FaGlobe size={20} className="text-brand-text dark:text-gray-300 group-hover:text-brand-primary transition-colors duration-200" />
                <span className="text-sm font-semibold text-brand-text dark:text-gray-300 hidden lg:inline group-hover:text-brand-primary transition-colors duration-200">
                  {language.toUpperCase()}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 animate-in slide-in-from-top-2 duration-200">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`cursor-pointer transition-colors duration-200 ${language === lang.code ? 'bg-brand-light dark:bg-gray-700 text-brand-primary font-medium' : ''}`}
                  >
                    <span className="mr-2 text-lg">{lang.flag}</span>
                    {lang.label}
                    {language === lang.code && <span className="ml-auto text-brand-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            {isAuthenticated && (
              <div ref={notificationRef} className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 rounded-full hover:bg-brand-light dark:hover:bg-gray-800 transition-all duration-300 ease-in-out focus:outline-none group cursor-pointer"
                >
                  <FaBell
                    size={20}
                    className={`transition-all duration-300 ${isNotificationOpen ? 'text-brand-primary scale-110' : 'text-brand-text dark:text-gray-300 group-hover:text-brand-primary group-hover:scale-110'}`}
                  />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <div
                  className={`absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-brand-light dark:border-gray-700 overflow-hidden z-50
                    transition-all duration-300 ease-out origin-top-right
                    ${isNotificationOpen
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
                >
                  <div className="px-4 py-3 border-b border-brand-light dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <h4 className="font-semibold text-brand-secondary dark:text-white">
                      {t('header.notifications') || 'Thông báo'}
                    </h4>
                    {unreadCount > 0 && (
                      <button className="text-xs font-medium text-brand-primary hover:text-brand-secondary dark:hover:text-gray-300 transition-colors duration-200 cursor-pointer">
                        {t('header.markAllRead') || 'Đánh dấu đã đọc'}
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-8 text-center text-brand-text/70 dark:text-gray-400 text-sm flex flex-col items-center gap-2">
                      <FaBell className="text-brand-light/80 dark:text-gray-700" size={32} />
                      {t('header.noNotifications') || 'Chưa có thông báo'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-brand-light dark:hover:bg-gray-800 transition-all duration-300 ease-in-out border border-transparent hover:border-brand-border/50 dark:hover:border-gray-700 focus:outline-none group cursor-pointer"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={user?.fullname || 'User'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-sm transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-white font-semibold text-sm shadow-sm transition-transform duration-300 group-hover:scale-105">
                      {userInitial}
                    </div>
                  )}
                  <span className="hidden sm:block text-sm font-medium text-brand-secondary dark:text-white transition-colors duration-200 group-hover:text-brand-primary">
                    {user?.fullname || 'User'}
                  </span>
                  {isDropdownOpen ? (
                    <FaChevronUp
                      size={12}
                      className="text-brand-text/50 dark:text-gray-400 transition-all duration-300 group-hover:text-brand-primary"
                    />
                  ) : (
                    <FaChevronDown
                      size={12}
                      className="text-brand-text/50 dark:text-gray-400 transition-all duration-300 group-hover:text-brand-primary group-hover:rotate-180"
                    />
                  )}
                </button>

                <div
                  className={`absolute right-0 mt-3 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-brand-light dark:border-gray-700 overflow-hidden z-50
                    transition-all duration-300 ease-out origin-top-right
                    ${isDropdownOpen
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
                >
                  <div className="px-4 py-3 border-b border-brand-light dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <p className="font-semibold text-brand-secondary dark:text-white">{user?.fullname}</p>
                    <p className="text-sm text-brand-text/80 dark:text-gray-400 truncate mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-text dark:text-gray-300 hover:bg-brand-light dark:hover:bg-gray-800 hover:text-brand-primary dark:hover:text-white transition-all duration-200 group cursor-pointer"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaUser size={16} className="text-brand-text/60 dark:text-gray-500 group-hover:text-brand-primary transition-colors" />
                      {t('header.profile') || 'Hồ sơ của tôi'}
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-text dark:text-gray-300 hover:bg-brand-light dark:hover:bg-gray-800 hover:text-brand-primary dark:hover:text-white transition-all duration-200 group cursor-pointer"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <FaChartBar size={16} className="text-brand-text/60 dark:text-gray-500 group-hover:text-brand-primary transition-colors" />
                      {t('header.dashboard') || 'Dashboard'}
                    </Link>
                    <div className="h-px bg-brand-light dark:bg-gray-700 my-1 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-all duration-200 group text-left cursor-pointer"
                    >
                      <FaSignOutAlt size={16} className="text-red-400 group-hover:text-red-600 transition-colors" />
                      {t('header.logout') || 'Đăng xuất'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="hidden md:block px-4 py-2 text-base font-medium border border-brand-primary text-brand-primary hover:!text-white hover:bg-brand-primary rounded-full transition-all duration-300 cursor-pointer"
                >
                  {t('header.login') || 'Đăng nhập'}
                </Link>
                <Link
                  to="/register"
                  className="hidden md:block px-5 py-2 text-base font-medium bg-gradient-brand text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                >
                  {t('header.register') || 'Đăng ký'}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-brand-light dark:hover:bg-gray-800 transition-colors duration-300 ml-1 cursor-pointer"
            >
              {isMenuOpen ? <FaTimes size={22} className="text-brand-text dark:text-gray-300" /> : <FaBars size={22} className="text-brand-text dark:text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-2 border-t border-brand-light dark:border-gray-700 animate-in slide-in-from-top-4 fade-in duration-300 ease-out">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 mb-1 ${
                  isActive(link.to)
                    ? 'text-brand-primary bg-brand-light/50 dark:bg-brand-primary/20 font-semibold'
                    : 'text-brand-secondary dark:text-gray-200 font-medium hover:text-brand-primary dark:hover:text-white hover:bg-brand-light/50 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon size={20} className={isActive(link.to) ? 'text-brand-primary' : 'text-brand-text/70 dark:text-gray-400'} />
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Mobile theme toggle */}
            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-brand-light/50 dark:hover:bg-gray-800/50 transition-all duration-200 mb-1">
              <div className="flex items-center gap-3 text-brand-secondary dark:text-gray-200 font-medium">
                {isDarkMode ? <FaMoon size={20} className="text-brand-text/70 dark:text-gray-400" /> : <FaSun size={20} className="text-brand-text/70 dark:text-gray-400" />}
                <span>{t('header.appearance') || 'Giao diện'}</span>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>

            {!isAuthenticated && (
              <div className="mt-2 pt-4 border-t border-brand-light dark:border-gray-700 flex flex-col gap-3 px-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 text-center font-medium border border-brand-primary text-brand-primary hover:!text-white hover:bg-brand-primary rounded-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.login') || 'Đăng nhập'}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 text-center font-medium bg-gradient-brand text-white rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('header.register') || 'Đăng ký'}
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header