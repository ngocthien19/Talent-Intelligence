import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaFilter,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaClock,
  FaBriefcase,
  FaCheck,
  FaMoneyBillWave,
  FaChevronDown
} from 'react-icons/fa'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup
} from '~/components/ui/dropdown-menu'
import {
  LOCATIONS,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES,
  SALARY_RANGES,
  getExperienceLabel,
  getEmploymentTypeLabel
} from '~/utils/constant'

const JobFilters = ({ filters, onFilterChange, onClearFilters, onClearFilter }) => {
  const { t } = useLanguage()

  const filterOptions = filters.options || {}
  const activeFilters = filters.active || {}

  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.category_id) count++
    if (activeFilters.location) count++
    if (activeFilters.experience_level) count++
    if (activeFilters.employment_type) count++
    if (activeFilters.salary_range) count++
    return count
  }

  const activeCount = getActiveFilterCount()

  const getSalaryLabel = (value) => {
    if (!value) return 'Tất cả mức lương'
    const found = SALARY_RANGES.find(s => s.value === value)
    return found ? found.label : 'Tất cả mức lương'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter size={18} className="text-brand-text/60 dark:text-gray-400" />
          <span className="font-medium text-brand-secondary dark:text-white">
            {t('jobs.filters') || 'Bộ lọc'}
          </span>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-0.5 text-xs font-medium text-white bg-brand-primary rounded-full"
            >
              {activeCount}
            </motion.span>
          )}
        </div>
        {activeCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="px-3 py-1.5 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white transition-all duration-300 cursor-pointer flex items-center gap-1.5"
          >
            <FaTimes size={14} />
            {t('jobs.clearAll') || 'Xóa tất cả'}
          </motion.button>
        )}
      </div>

      {/* Active filters badges */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-brand-light dark:border-gray-700 overflow-hidden"
          >
            {activeFilters.category_id && (
              <Badge
                label={filterOptions.categories?.find(c => c.id === activeFilters.category_id)?.name || 'Danh mục'}
                onRemove={() => onClearFilter('category_id')}
              />
            )}
            {activeFilters.location && (
              <Badge
                label={activeFilters.location}
                onRemove={() => onClearFilter('location')}
              />
            )}
            {activeFilters.experience_level && (
              <Badge
                label={getExperienceLabel(activeFilters.experience_level)}
                onRemove={() => onClearFilter('experience_level')}
              />
            )}
            {activeFilters.employment_type && (
              <Badge
                label={getEmploymentTypeLabel(activeFilters.employment_type)}
                onRemove={() => onClearFilter('employment_type')}
              />
            )}
            {activeFilters.salary_range && (
              <Badge
                label={getSalaryLabel(activeFilters.salary_range)}
                onRemove={() => onClearFilter('salary_range')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-3">
        {/* Category filter */}
        {filterOptions.categories && filterOptions.categories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 cursor-pointer">
              <FaTag size={14} className="text-brand-text/60 dark:text-gray-400" />
              <span className="text-brand-text dark:text-gray-300">
                {activeFilters.category_id
                  ? filterOptions.categories.find(c => c.id === activeFilters.category_id)?.name
                  : (t('jobs.category') || 'Danh mục')}
              </span>
              <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t('jobs.category') || 'Danh mục'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onFilterChange('category_id', '')} className="cursor-pointer">
                  {t('jobs.all') || 'Tất cả'}
                </DropdownMenuItem>
                {filterOptions.categories.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => onFilterChange('category_id', category.id)}
                    className={`cursor-pointer transition-all duration-200 ${activeFilters.category_id === category.id ? 'text-brand-primary font-medium' : ''}`}
                  >
                    {category.name}
                    {activeFilters.category_id === category.id && (
                      <FaCheck className="ml-auto text-brand-primary" size={14} />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Location filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 cursor-pointer">
            <FaMapMarkerAlt size={14} className="text-brand-text/60 dark:text-gray-400" />
            <span className="text-brand-text dark:text-gray-300">
              {activeFilters.location || (t('jobs.location') || 'Địa điểm')}
            </span>
            <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('jobs.location') || 'Địa điểm'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {LOCATIONS.map((location) => (
                <DropdownMenuItem
                  key={location.value}
                  onClick={() => onFilterChange('location', location.value)}
                  className={`cursor-pointer transition-all duration-200 ${activeFilters.location === location.value ? 'text-brand-primary font-medium' : ''}`}
                >
                  {location.label}
                  {activeFilters.location === location.value && (
                    <FaCheck className="ml-auto text-brand-primary" size={14} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Experience level filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 cursor-pointer">
            <FaClock size={14} className="text-brand-text/60 dark:text-gray-400" />
            <span className="text-brand-text dark:text-gray-300">
              {activeFilters.experience_level
                ? getExperienceLabel(activeFilters.experience_level)
                : (t('jobs.experience') || 'Kinh nghiệm')}
            </span>
            <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('jobs.experience') || 'Kinh nghiệm'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EXPERIENCE_LEVELS.map((level) => (
                <DropdownMenuItem
                  key={level.value}
                  onClick={() => onFilterChange('experience_level', level.value)}
                  className={`cursor-pointer transition-all duration-200 ${activeFilters.experience_level === level.value ? 'text-brand-primary font-medium' : ''}`}
                >
                  {level.label}
                  {activeFilters.experience_level === level.value && (
                    <FaCheck className="ml-auto text-brand-primary" size={14} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Employment type filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 cursor-pointer">
            <FaBriefcase size={14} className="text-brand-text/60 dark:text-gray-400" />
            <span className="text-brand-text dark:text-gray-300">
              {activeFilters.employment_type
                ? getEmploymentTypeLabel(activeFilters.employment_type)
                : (t('jobs.type') || 'Loại hình')}
            </span>
            <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('jobs.type') || 'Loại hình'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {EMPLOYMENT_TYPES.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => onFilterChange('employment_type', type.value)}
                  className={`cursor-pointer transition-all duration-200 ${activeFilters.employment_type === type.value ? 'text-brand-primary font-medium' : ''}`}
                >
                  {type.label}
                  {activeFilters.employment_type === type.value && (
                    <FaCheck className="ml-auto text-brand-primary" size={14} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Salary range filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 cursor-pointer">
            <FaMoneyBillWave size={14} className="text-brand-text/60 dark:text-gray-400" />
            <span className="text-brand-text dark:text-gray-300">
              {activeFilters.salary_range
                ? getSalaryLabel(activeFilters.salary_range)
                : (t('jobs.salary') || 'Mức lương')}
            </span>
            <FaChevronDown size={12} className="text-brand-text/40 dark:text-gray-500" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{t('jobs.salary') || 'Mức lương'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SALARY_RANGES.map((range) => (
                <DropdownMenuItem
                  key={range.value}
                  onClick={() => onFilterChange('salary_range', range.value)}
                  className={`cursor-pointer transition-all duration-200 ${activeFilters.salary_range === range.value ? 'text-brand-primary font-medium' : ''}`}
                >
                  {range.label}
                  {activeFilters.salary_range === range.value && (
                    <FaCheck className="ml-auto text-brand-primary" size={14} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}

// Badge component for active filters
const Badge = ({ label, onRemove }) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 rounded-full border border-brand-light dark:border-gray-600"
    >
      {label}
      <motion.button
        whileHover={{ scale: 1.2, rotate: 90 }}
        whileTap={{ scale: 0.8 }}
        onClick={onRemove}
        className="hover:text-brand-primary dark:hover:text-white transition-colors duration-200 cursor-pointer"
        aria-label="Remove filter"
      >
        <FaTimes size={12} />
      </motion.button>
    </motion.span>
  )
}

export default JobFilters