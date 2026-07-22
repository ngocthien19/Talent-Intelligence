import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { dashboardApi } from '~/api/hr/dashboard.api'
import { FaSpinner, FaChartLine } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useLanguage } from '~/hooks/useLanguage'

import DashboardHeader from '~/components/hr/dashboard/DashboardHeader'
import StatsGrid from '~/components/hr/dashboard/StatsGrid'
import AverageScores from '~/components/hr/dashboard/AverageScores'
import StatusDistribution from '~/components/hr/dashboard/StatusDistribution'
import TopSkills from '~/components/hr/dashboard/TopSkills'
import RecentCandidates from '~/components/hr/dashboard/RecentCandidates'
import QuickActions from '~/components/hr/dashboard/QuickActions'

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

const Dashboard = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)

  // Đọc từ URL params
  const initialPeriod = searchParams.get('period') || '30days'
  const initialStartDate = searchParams.get('startDate')
    ? new Date(searchParams.get('startDate'))
    : null
  const initialEndDate = searchParams.get('endDate')
    ? new Date(searchParams.get('endDate'))
    : null

  const [period, setPeriod] = useState(initialPeriod)
  const [startDate, setStartDate] = useState(initialStartDate)
  const [endDate, setEndDate] = useState(initialEndDate)

  // Cập nhật URL khi filter thay đổi
  useEffect(() => {
    const params = {}
    if (period && period !== '30days') {
      params.period = period
    }
    if (startDate) {
      params.startDate = startDate.toISOString().split('T')[0]
    }
    if (endDate) {
      params.endDate = endDate.toISOString().split('T')[0]
    }

    setSearchParams(params, { replace: true })
  }, [period, startDate, endDate, setSearchParams])

  // Fetch data khi filter thay đổi
  useEffect(() => {
    fetchDashboard()
  }, [period, startDate, endDate])

  const fetchDashboard = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = { period }

      if (period === 'custom' && startDate && endDate) {
        params.startDate = startDate.toISOString().split('T')[0]
        params.endDate = endDate.toISOString().split('T')[0]
      }

      const response = await dashboardApi.getDashboard(params)

      if (response.success && response.data) {
        setDashboardData(response.data)
      } else {
        const message = response.message || 'Không thể tải dữ liệu dashboard'
        setError(message)
        toast.error(message)
      }
    } catch (err) {
      setError(err.message || 'Không thể tải dữ liệu dashboard')
      toast.error('Không thể tải dữ liệu dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <FaSpinner className="animate-spin text-brand-primary" size={40} />
          <p className="text-brand-text/60 dark:text-gray-400">{t('common.loading') || 'Đang tải dữ liệu...'}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <FaChartLine size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">{t('common.error') || 'Có lỗi xảy ra'}</h3>
          <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">{error}</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-colors cursor-pointer"
          >
            {t('common.retry') || 'Thử lại'}
          </button>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <FaChartLine size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand-secondary dark:text-white">{t('common.noData') || 'Không có dữ liệu'}</h3>
          <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-1">{t('common.noDataDesc') || 'Chưa có dữ liệu để hiển thị'}</p>
        </div>
      </div>
    )
  }

  const { summary, statusCounts, averageScores, topSkills, recentCandidates } = dashboardData

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Header */}
      <DashboardHeader
        period={period}
        setPeriod={setPeriod}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Stats Grid */}
      <StatsGrid summary={summary} />

      {/* Average Scores */}
      <AverageScores scores={averageScores} />

      {/* Status Distribution & Top Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <StatusDistribution statusCounts={statusCounts} className="lg:col-span-2" />
        <TopSkills topSkills={topSkills} />
      </div>

      {/* Recent Candidates & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <RecentCandidates candidates={recentCandidates} className="lg:col-span-2" />
        <QuickActions />
      </div>
    </motion.div>
  )
}

export default Dashboard