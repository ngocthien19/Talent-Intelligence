import { motion } from 'framer-motion'
import { FaPlus, FaCalendarAlt } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

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

const InterviewHeader = ({
  totalCount,
  todayCount,
  upcomingCount,
  onOpenCreateModal
}) => {
  const { t } = useLanguage()

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
          {t('hr.interviews') || 'Quản lý phỏng vấn'}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-1">
          <p className="text-sm text-brand-text/60 dark:text-gray-400">
            {t('hr.interview.total') || 'Tổng'}{' '}
            <span className="font-semibold text-brand-primary">{totalCount}</span>{' '}
            {t('hr.interview.schedules') || 'lịch'}
          </p>
          {todayCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded-full font-medium">
              {todayCount} {t('hr.interview.today') || 'hôm nay'}
            </span>
          )}
          {upcomingCount > 0 && (
            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full font-medium">
              {upcomingCount} {t('hr.interview.upcoming') || 'sắp tới'}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-brand-primary text-white rounded-lg hover:bg-brand-primary/80 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95 shadow-sm"
        >
          <FaPlus size={14} />
          <span className="hidden sm:inline">{t('hr.interview.schedule') || 'Tạo lịch'}</span>
        </button>
      </div>
    </motion.div>
  )
}

export default InterviewHeader