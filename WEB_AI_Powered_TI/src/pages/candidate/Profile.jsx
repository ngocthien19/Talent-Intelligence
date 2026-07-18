import { useState, useEffect } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { useScrollToTop } from '~/hooks/useScrollToTop'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { profileApi } from '~/api/candidate/profile.api'

// Components
import ProfileSidebar from '~/components/candidate/profile/ProfileSidebar'
import ProfileInfo from '~/components/candidate/profile/ProfileInfo'
import ChangePassword from '~/components/candidate/profile/ChangePassword'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const Profile = () => {
  useScrollToTop()
  const { t } = useLanguage()
  const { user, fetchProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('info')

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await profileApi.getProfile()
      if (response.success) {
        setProfile(response.data)
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể tải thông tin hồ sơ')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [])

  const handleUpdateSuccess = async () => {
    await fetchProfile()
    await loadProfile()
  }

  if (isLoading) {
    return (
      <div className="app-container py-6 animate-pulse">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 space-y-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="app-container py-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - chiếm 1/4 */}
          <div className="lg:col-span-1">
            <ProfileSidebar
              user={user}
              profile={profile}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>

          {/* Content - chiếm 3/4 */}
          <div className="lg:col-span-3">
            {activeTab === 'info' ? (
              <ProfileInfo
                profile={profile}
                onUpdateSuccess={handleUpdateSuccess}
              />
            ) : (
              <ChangePassword />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Profile