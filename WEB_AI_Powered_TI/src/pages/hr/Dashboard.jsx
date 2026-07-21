import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'
import { dashboardApi } from '~/api/hr/dashboard.api'
import {
  FaUsers,
  FaBriefcase,
  FaFileAlt,
  FaCalendarAlt,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaUserPlus,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaDownload,
  FaPlus,
  FaSearch,
  FaFilter
} from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const statVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const Dashboard = () => {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [period, setPeriod] = useState('30days')

  const periods = [
    { value: 'today', label: 'Hôm nay' },
    { value: '7days', label: '7 ngày qua' },
    { value: '30days', label: '30 ngày qua' }
  ]

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboard()
  }, [period])

  const fetchDashboard = async () => {
    setIsLoading(true)
    try {
      const response = await dashboardApi.getDashboard({ period })
      if (response.success) {
        setDashboardData(response.data)
      } else {
        toast.error(response.message || 'Không thể tải dữ liệu dashboard')
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Không thể tải dữ liệu dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // Format số
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  // Status color mapping
  const statusColors = {
    pending: 'bg-yellow-500',
    analyzing: 'bg-blue-500',
    analyzed: 'bg-indigo-500',
    shortlisted: 'bg-emerald-500',
    interviewed: 'bg-purple-500',
    offered: 'bg-orange-500',
    hired: 'bg-green-500',
    rejected: 'bg-red-500'
  }

  const statusLabels = {
    pending: 'Đang chờ',
    analyzing: 'Đang phân tích',
    analyzed: 'Đã phân tích',
    shortlisted: 'Đã lọc',
    interviewed: 'Đã phỏng vấn',
    offered: 'Đã offer',
    hired: 'Đã nhận',
    rejected: 'Từ chối'
  }

  const statusIcons = {
    pending: FaClock,
    analyzing: FaSpinner,
    analyzed: FaCheckCircle,
    shortlisted: FaCheckCircle,
    interviewed: FaUserPlus,
    offered: FaCheckCircle,
    hired: FaCheckCircle,
    rejected: FaTimesCircle
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-[60vh]"
      >
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-brand-primary" size={40} />
          <p className="text-brand-text/60 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </motion.div>
    )
  }

  if (!dashboardData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-[60vh]"
      >
        <div className="text-center">
          <FaChartLine size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">Không có dữ liệu</h3>
          <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">Chưa có dữ liệu để hiển thị</p>
        </div>
      </motion.div>
    )
  }

  const { summary, statusCounts, averageScores, topSkills, recentCandidates } = dashboardData

  // Stats data
  const stats = [
    {
      label: t('hr.totalCandidates') || 'Tổng ứng viên',
      value: formatNumber(summary?.total || 0),
      icon: FaUsers,
      change: '+12%',
      isUp: true,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/20'
    },
    {
      label: t('hr.totalJobs') || 'Việc làm đang tuyển',
      value: '47',
      icon: FaBriefcase,
      change: '+5%',
      isUp: true,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20'
    },
    {
      label: t('hr.totalApplications') || 'Đơn ứng tuyển',
      value: formatNumber(summary?.total || 0),
      icon: FaFileAlt,
      change: '+23%',
      isUp: true,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-950/20'
    },
    {
      label: t('hr.todayInterviews') || 'Phỏng vấn hôm nay',
      value: '8',
      icon: FaCalendarAlt,
      change: '-2%',
      isUp: false,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/20'
    }
  ]

  // Status data for chart
  const statusData = Object.entries(statusCounts || {})
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      label: statusLabels[status] || status,
      value: count,
      color: statusColors[status] || 'bg-gray-500',
      icon: statusIcons[status] || FaClock
    }))

  const totalStatus = statusData.reduce((sum, item) => sum + item.value, 0)

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
            {t('hr.dashboard') || 'Dashboard'}
          </h1>
          <p className="text-sm text-brand-text/60 dark:text-gray-400">
            Tổng quan tình hình tuyển dụng của công ty bạn
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Period filter */}
          <div className="flex items-center gap-1 p-1 bg-brand-light/20 dark:bg-gray-800 rounded-lg">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  period === p.value
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-brand-text dark:text-gray-400 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-95">
            <FaDownload size={12} />
            {t('hr.exportReport') || 'Xuất báo cáo'}
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={statVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              <span className={`text-xs font-medium ${stat.isUp ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-0.5`}>
                {stat.isUp ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-brand-secondary dark:text-white mt-2">{stat.value}</h3>
            <p className="text-xs md:text-sm text-brand-text/60 dark:text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Status Distribution */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
        >
          <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
            <FaChartLine size={18} className="text-brand-primary" />
            {t('hr.statusDistribution') || 'Phân bố trạng thái ứng viên'}
          </h2>
          {statusData.length > 0 ? (
            <div className="space-y-3">
              {statusData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex items-center justify-between text-xs md:text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <item.icon size={14} className={`${item.color.replace('bg-', 'text-')} dark:${item.color.replace('bg-', 'text-')}`} />
                      <span className="text-brand-text dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="font-medium text-brand-secondary dark:text-white">
                      {item.value} ({totalStatus > 0 ? Math.round((item.value / totalStatus) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: totalStatus > 0 ? `${(item.value / totalStatus) * 100}%` : '0%' }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.05, ease: 'easeOut' }}
                      className={`h-full ${item.color} rounded-full transition-all duration-500 group-hover:opacity-80`}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-brand-text/60 dark:text-gray-400">
              <p className="text-sm">Chưa có dữ liệu trạng thái</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-brand-light/50 dark:border-gray-700/50 flex items-center justify-between text-xs md:text-sm text-brand-text/60 dark:text-gray-400">
            <span>{t('hr.totalCandidates') || 'Tổng'}: {totalStatus} {t('hr.candidates') || 'ứng viên'}</span>
            <Link
              to="/hr/candidates"
              className="text-brand-primary hover:underline transition-all duration-200 cursor-pointer hover:scale-105 inline-flex items-center gap-1"
            >
              {t('hr.viewAll') || 'Xem tất cả'} →
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
        >
          <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white mb-4">
            {t('hr.quickActions') || 'Hành động nhanh'}
          </h2>
          <div className="space-y-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link
                to="/hr/jobs/new"
                className="flex items-center gap-3 p-3 rounded-xl bg-brand-light/20 dark:bg-gray-700/30 hover:bg-brand-light/40 dark:hover:bg-gray-700/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary group-hover:scale-110 transition-transform duration-200">
                  <FaBriefcase size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-secondary dark:text-white">{t('hr.postNewJob') || 'Đăng tin tuyển dụng mới'}</p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.postNewJobDesc') || 'Tạo ngay để thu hút ứng viên'}</p>
                </div>
                <span className="text-brand-text/40 group-hover:text-brand-primary transition-colors duration-200 group-hover:translate-x-1 transform">→</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link
                to="/hr/search"
                className="flex items-center gap-3 p-3 rounded-xl bg-brand-light/20 dark:bg-gray-700/30 hover:bg-brand-light/40 dark:hover:bg-gray-700/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform duration-200">
                  <FaSearch size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-secondary dark:text-white">{t('hr.searchCandidates') || 'Tìm kiếm ứng viên'}</p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.searchCandidatesDesc') || 'Tìm ứng viên tiềm năng'}</p>
                </div>
                <span className="text-brand-text/40 group-hover:text-emerald-500 transition-colors duration-200 group-hover:translate-x-1 transform">→</span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
              <Link
                to="/hr/interviews"
                className="flex items-center gap-3 p-3 rounded-xl bg-brand-light/20 dark:bg-gray-700/30 hover:bg-brand-light/40 dark:hover:bg-gray-700/50 transition-all duration-200 group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-200">
                  <FaCalendarAlt size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-brand-secondary dark:text-white">{t('hr.manageInterviews') || 'Quản lý lịch phỏng vấn'}</p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">{t('hr.manageInterviewsDesc') || 'Xem và sắp xếp lịch'}</p>
                </div>
                <span className="text-brand-text/40 group-hover:text-purple-500 transition-colors duration-200 group-hover:translate-x-1 transform">→</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activities & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Activities */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white flex items-center gap-2">
              <FaClock size={18} className="text-brand-primary" />
              {t('hr.recentActivities') || 'Hoạt động gần đây'}
            </h2>
            <Link to="/hr/activities" className="text-xs md:text-sm text-brand-primary hover:underline transition-all duration-200 cursor-pointer hover:scale-105">
              {t('hr.viewAll') || 'Xem tất cả'}
            </Link>
          </div>
          <div className="space-y-3">
            {recentCandidates && recentCandidates.length > 0 ? (
              recentCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-brand-light/20 dark:hover:bg-gray-700/30 transition-all duration-200 cursor-pointer"
                >
                  <div className={`p-2 rounded-xl ${
                    candidate.status === 'hired' ? 'bg-green-50 dark:bg-green-950/20' :
                      candidate.status === 'rejected' ? 'bg-red-50 dark:bg-red-950/20' :
                        'bg-blue-50 dark:bg-blue-950/20'
                  }`}>
                    {candidate.status === 'hired' ? (
                      <FaCheckCircle size={14} className="text-green-500" />
                    ) : candidate.status === 'rejected' ? (
                      <FaTimesCircle size={14} className="text-red-500" />
                    ) : (
                      <FaUserPlus size={14} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
                      {candidate.name || 'Ứng viên'}
                    </p>
                    <p className="text-xs text-brand-text/60 dark:text-gray-400 truncate">
                      {candidate.position_applied || candidate.job_title || 'Vị trí chưa xác định'}
                    </p>
                  </div>
                  <span className="text-xs text-brand-text/40 dark:text-gray-500 flex-shrink-0">
                    {candidate.created_at ? new Date(candidate.created_at).toLocaleDateString('vi-VN') : ''}
                  </span>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-brand-text/60 dark:text-gray-400">
                <p className="text-sm">Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Skills */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
        >
          <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
            <FaChartLine size={18} className="text-brand-primary" />
            Kỹ năng hàng đầu
          </h2>
          <div className="space-y-3">
            {topSkills && topSkills.length > 0 ? (
              topSkills.slice(0, 8).map((skill, index) => (
                <motion.div
                  key={skill.skill || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between group"
                >
                  <span className="text-sm text-brand-text dark:text-gray-300 group-hover:text-brand-primary transition-colors duration-200">
                    {skill.skill || 'Chưa xác định'}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 md:w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((skill.count / (topSkills[0]?.count || 1)) * 100, 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                        className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
                      />
                    </div>
                    <span className="text-xs text-brand-text/40 dark:text-gray-500">{skill.count}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-brand-text/60 dark:text-gray-400">
                <p className="text-sm">Chưa có dữ liệu kỹ năng</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Dashboard