import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  FaUser,
  FaHistory,
  FaHeart,
  FaKey,
  FaSignOutAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const sidebarVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const menuItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  })
}

const ProfileSidebar = ({ user, profile, activeTab, onTabChange }) => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const avatarUrl = profile?.avatar?.secure_url || user?.avatar?.secure_url || null
  const displayName = profile?.fullname || user?.fullname || 'User'
  const userEmail = profile?.email || user?.email || ''

  const menuItems = [
    {
      id: 'info',
      icon: FaUser,
      label: t('profile.info') || 'Thông tin cá nhân'
    },
    {
      id: 'password',
      icon: FaKey,
      label: t('profile.changePassword') || 'Đổi mật khẩu'
    }
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <motion.div
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 overflow-hidden sticky top-24"
    >
      {/* Avatar */}
      <div className="p-6 text-center border-b border-brand-light/50 dark:border-gray-700/50">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-brand flex items-center justify-center text-white text-2xl font-bold mx-auto border-2 border-brand-light dark:border-gray-700">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="uppercase">{displayName.charAt(0)}</span>
          )}
        </div>
        <h3 className="mt-3 font-semibold text-brand-secondary dark:text-white">
          {displayName}
        </h3>
        <p className="text-xs text-brand-text/60 dark:text-gray-400 flex items-center justify-center gap-1 mt-0.5">
          <FaEnvelope size={10} />
          {userEmail}
        </p>
      </div>

      {/* Menu */}
      <div className="p-2 space-y-1">
        {menuItems.map((item, index) => (
          <motion.button
            key={item.id}
            custom={index}
            variants={menuItemVariants}
            initial="hidden"
            animate="visible"
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
              activeTab === item.id
                ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary font-medium'
                : 'text-brand-text dark:text-gray-300 hover:bg-brand-light dark:hover:bg-gray-700 hover:text-brand-primary dark:hover:text-white'
            }`}
          >
            <item.icon size={16} className="flex-shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="w-1.5 h-1.5 rounded-full bg-brand-primary"
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        ))}

        <div className="border-t border-brand-light/50 dark:border-gray-700/50 my-2" />

        <motion.button
          variants={menuItemVariants}
          custom={menuItems.length}
          initial="hidden"
          animate="visible"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
        >
          <FaSignOutAlt size={16} className="flex-shrink-0" />
          <span className="flex-1 text-left">{t('header.logout') || 'Đăng xuất'}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProfileSidebar