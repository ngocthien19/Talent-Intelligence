import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCalendarAlt, FaChevronDown, FaTimes, FaCheck } from 'react-icons/fa'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '~/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '~/components/ui/tooltip'
import { useLanguage } from '~/hooks/useLanguage'
import { formatDate, dateToInputString, inputStringToDate } from '~/utils/format'

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

const DashboardHeader = ({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}) => {
  const { t } = useLanguage()
  const [dateError, setDateError] = useState('')
  const [tempStartDate, setTempStartDate] = useState(null)
  const [tempEndDate, setTempEndDate] = useState(null)

  const startInputRef = useRef(null)
  const endInputRef = useRef(null)

  // Periods với key ngôn ngữ
  const getPeriods = () => [
    { value: 'today', label: t('hr.today') || 'Hôm nay' },
    { value: '7days', label: t('hr.last7Days') || '7 ngày qua' },
    { value: '30days', label: t('hr.last30Days') || '30 ngày qua' },
    { value: 'custom', label: t('hr.custom') || 'Tùy chọn' }
  ]

  const PERIODS = getPeriods()

  useEffect(() => {
    if (period === 'custom') {
      setTempStartDate(startDate || null)
      setTempEndDate(endDate || null)
    }
  }, [period, startDate, endDate])

  const validateDates = (start, end) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    if (!start || !end) {
      setDateError(t('hr.dateRequired') || 'Vui lòng chọn đầy đủ từ ngày và đến ngày')
      return false
    }

    if (start > today) {
      setDateError(t('hr.dateStartInvalid') || 'Ngày bắt đầu không được vượt quá ngày hiện tại')
      return false
    }

    if (end > today) {
      setDateError(t('hr.dateEndInvalid') || 'Ngày kết thúc không được vượt quá ngày hiện tại')
      return false
    }

    if (start > end) {
      setDateError(t('hr.dateStartEnd') || 'Ngày bắt đầu không được lớn hơn ngày kết thúc')
      return false
    }

    setDateError('')
    return true
  }

  const handleApplyCustomDate = () => {
    if (validateDates(tempStartDate, tempEndDate)) {
      setStartDate(tempStartDate)
      setEndDate(tempEndDate)
      setPeriod('custom')
    }
  }

  const handleClearDates = () => {
    setStartDate(null)
    setEndDate(null)
    setTempStartDate(null)
    setTempEndDate(null)
    setDateError('')
    setPeriod('30days')
  }

  const getPeriodLabel = () => {
    if (period === 'custom' && startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }
    const found = PERIODS.find(p => p.value === period)
    return found ? found.label : t('hr.last30Days') || '30 ngày qua'
  }

  const handleStartDateChange = (e) => {
    const value = e.target.value
    const date = inputStringToDate(value)
    if (startInputRef.current) {
      startInputRef.current.value = value
    }
    setTempStartDate(date)
    if (dateError) setDateError('')
  }

  const handleEndDateChange = (e) => {
    const value = e.target.value
    const date = inputStringToDate(value)
    if (endInputRef.current) {
      endInputRef.current.value = value
    }
    setTempEndDate(date)
    if (dateError) setDateError('')
  }

  // Khi blur khỏi input, validate
  const handleStartBlur = () => {
    if (tempStartDate && tempEndDate) {
      validateDates(tempStartDate, tempEndDate)
    }
  }

  const handleEndBlur = () => {
    if (tempStartDate && tempEndDate) {
      validateDates(tempStartDate, tempEndDate)
    }
  }

  return (
    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 relative">
      <div>
        <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">{t('hr.dashboard') || 'Dashboard'}</h1>
        <p className="text-sm text-brand-text/60 dark:text-gray-400">
          {t('hr.dashboardDesc') || 'Tổng quan tình hình tuyển dụng của công ty bạn'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 px-3 py-2 h-10 text-sm font-medium border border-brand-light/50 dark:border-gray-700 rounded-lg hover:bg-brand-light/30 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer bg-white dark:bg-gray-900 text-brand-text dark:text-gray-300"
            >
              <FaCalendarAlt size={14} className="text-brand-primary" />
              <span>{getPeriodLabel()}</span>
              <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-xl shadow-xl">
            {PERIODS.map((p) => (
              <DropdownMenuItem
                key={p.value}
                onClick={() => {
                  if (p.value === 'custom') {
                    setTempStartDate(startDate || null)
                    setTempEndDate(endDate || null)
                    setPeriod('custom')
                  } else {
                    setPeriod(p.value)
                    setStartDate(null)
                    setEndDate(null)
                    setTempStartDate(null)
                    setTempEndDate(null)
                    setDateError('')
                  }
                }}
                className={`cursor-pointer px-3 py-2 my-0.5 rounded-lg transition-all duration-200 ${
                  period === p.value && p.value !== 'custom'
                    ? 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20'
                    : 'text-brand-text dark:text-gray-300 hover:bg-brand-light/30 dark:hover:bg-gray-700/50'
                }`}
              >
                {p.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Khung hiển thị Input Ngày Tháng */}
        <AnimatePresence>
          {period === 'custom' && (
            <motion.div
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 p-1.5 bg-white dark:bg-gray-900 border border-brand-light/50 dark:border-gray-700 rounded-lg shadow-sm h-10"
            >
              <div className="flex items-center gap-2 px-2">
                <span className="text-xs font-medium text-brand-text/60 dark:text-gray-400">{t('hr.fromDate') || 'Từ'}</span>
                <input
                  ref={startInputRef}
                  type="date"
                  defaultValue={tempStartDate ? dateToInputString(tempStartDate) : ''}
                  onChange={handleStartDateChange}
                  onBlur={handleStartBlur}
                  max={dateToInputString(new Date())}
                  className="bg-transparent text-sm text-brand-secondary dark:text-white focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <span className="text-brand-light/50 dark:text-gray-700">|</span>

              <div className="flex items-center gap-2 px-2">
                <span className="text-xs font-medium text-brand-text/60 dark:text-gray-400">{t('hr.toDate') || 'Đến'}</span>
                <input
                  ref={endInputRef}
                  type="date"
                  defaultValue={tempEndDate ? dateToInputString(tempEndDate) : ''}
                  onChange={handleEndDateChange}
                  onBlur={handleEndBlur}
                  max={dateToInputString(new Date())}
                  className="bg-transparent text-sm text-brand-secondary dark:text-white focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>

              <div className="flex items-center gap-1 pl-2 border-l border-brand-light/50 dark:border-gray-700">
                {/* Nút Áp dụng với Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleApplyCustomDate}
                        disabled={!tempStartDate || !tempEndDate || !!dateError}
                        className="p-1.5 flex items-center justify-center text-white bg-brand-primary rounded hover:bg-brand-primary/80 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-primary"
                      >
                        <FaCheck size={12} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t('common.apply') || 'Áp dụng'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Nút Xóa với Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleClearDates}
                        className="p-1.5 flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-950/30 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-all cursor-pointer"
                      >
                        <FaTimes size={12} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{t('common.clear') || 'Hủy bỏ'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Báo lỗi nếu chọn ngày sai logic */}
        <AnimatePresence>
          {dateError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-6 left-0 lg:right-0 lg:left-auto text-xs text-red-500 font-medium whitespace-nowrap"
            >
              * {dateError}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default DashboardHeader