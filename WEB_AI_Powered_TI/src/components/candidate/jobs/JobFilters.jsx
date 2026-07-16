import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import {
  FaFilter,
  FaTimes,
  FaMapMarkerAlt,
  FaTag,
  FaClock,
  FaBriefcase,
  FaCheck
} from 'react-icons/fa'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '~/components/ui/dropdown-menu'

const JobFilters = ({ filters, onFilterChange, onClearFilters, onClearFilter }) => {
  const { t } = useLanguage()

  const getExperienceLabel = (level) => {
    const labels = {
      'entry': 'Mới tốt nghiệp',
      'junior': 'Junior (1-3 năm)',
      'mid': 'Mid-level (3-5 năm)',
      'senior': 'Senior (5-7 năm)',
      'lead': 'Lead (7-10 năm)',
      'manager': 'Manager (10+ năm)'
    }
    return labels[level] || level
  }

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      'full-time': 'Toàn thời gian',
      'part-time': 'Bán thời gian',
      'contract': 'Hợp đồng',
      'internship': 'Thực tập',
      'freelance': 'Freelance'
    }
    return labels[type] || type
  }

  const filterOptions = filters.options || {}
  const activeFilters = filters.active || {}

  // Lọc các filter đang active
  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.category_id) count++
    if (activeFilters.location) count++
    if (activeFilters.experience_level) count++
    if (activeFilters.employment_type) count++
    return count
  }

  const activeCount = getActiveFilterCount()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter size={18} className="text-brand-text/60 dark:text-gray-400" />
          <span className="font-medium text-brand-secondary dark:text-white">
            {t('jobs.filters') || 'Bộ lọc'}
          </span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-brand-primary rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-brand-primary hover:text-brand-secondary dark:hover:text-gray-300 transition-colors duration-200"
          >
            {t('jobs.clearAll') || 'Xóa tất cả'}
          </button>
        )}
      </div>

      {/* Active filters badges */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-brand-light dark:border-gray-700">
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
        </div>
      )}

      {/* Filter dropdowns */}
      <div className="flex flex-wrap gap-3">
        {/* Category filter */}
        {filterOptions.categories && filterOptions.categories.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
              <FaTag size={14} className="text-brand-text/60 dark:text-gray-400" />
              <span className="text-brand-text dark:text-gray-300">
                {activeFilters.category_id
                  ? filterOptions.categories.find(c => c.id === activeFilters.category_id)?.name
                  : (t('jobs.category') || 'Danh mục')}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
              <DropdownMenuLabel>{t('jobs.category') || 'Danh mục'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onFilterChange('category_id', '')}>
                {t('jobs.all') || 'Tất cả'}
              </DropdownMenuItem>
              {filterOptions.categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => onFilterChange('category_id', category.id)}
                  className={activeFilters.category_id === category.id ? 'text-brand-primary font-medium' : ''}
                >
                  {category.name}
                  {activeFilters.category_id === category.id && (
                    <FaCheck className="ml-auto text-brand-primary" size={14} />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Location filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
            <FaMapMarkerAlt size={14} className="text-brand-text/60 dark:text-gray-400" />
            <span className="text-brand-text dark:text-gray-300">
              {activeFilters.location || (t('jobs.location') || 'Địa điểm')}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
            <DropdownMenuLabel>{t('jobs.location') || 'Địa điểm'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFilterChange('location', '')}>
              {t('jobs.all') || 'Tất cả'}
            </DropdownMenuItem>
            {filterOptions.locations?.map((location) => (
              <DropdownMenuItem
                key={location}
                onClick={() => onFilterChange('location', location)}
                className={activeFilters.location === location ? 'text-brand-primary font-medium' : ''}
              >
                {location}
                {activeFilters.location === location && (
                  <FaCheck className="ml-auto text-brand-primary" size={14} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Experience level filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
            <FaClock size={14} className="text-brand-text/60 dark:text-gray-400" />
            <span className="text-brand-text dark:text-gray-300">
              {activeFilters.experience_level
                ? getExperienceLabel(activeFilters.experience_level)
                : (t('jobs.experience') || 'Kinh nghiệm')}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>{t('jobs.experience') || 'Kinh nghiệm'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFilterChange('experience_level', '')}>
              {t('jobs.all') || 'Tất cả'}
            </DropdownMenuItem>
            {filterOptions.experience_levels?.map((level) => (
              <DropdownMenuItem
                key={level}
                onClick={() => onFilterChange('experience_level', level)}
                className={activeFilters.experience_level === level ? 'text-brand-primary font-medium' : ''}
              >
                {getExperienceLabel(level)}
                {activeFilters.experience_level === level && (
                  <FaCheck className="ml-auto text-brand-primary" size={14} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Employment type filter */}
        <DropdownMenu>
          <DropdownMenuTrigger className="px-3 py-2 text-sm border border-brand-light dark:border-gray-700 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2">
            <FaBriefcase size={14} className="text-brand-text/60 dark:text-gray-400" />
            <span className="text-brand-text dark:text-gray-300">
              {activeFilters.employment_type
                ? getEmploymentTypeLabel(activeFilters.employment_type)
                : (t('jobs.type') || 'Loại hình')}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>{t('jobs.type') || 'Loại hình'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onFilterChange('employment_type', '')}>
              {t('jobs.all') || 'Tất cả'}
            </DropdownMenuItem>
            {filterOptions.employment_types?.map((type) => (
              <DropdownMenuItem
                key={type}
                onClick={() => onFilterChange('employment_type', type)}
                className={activeFilters.employment_type === type ? 'text-brand-primary font-medium' : ''}
              >
                {getEmploymentTypeLabel(type)}
                {activeFilters.employment_type === type && (
                  <FaCheck className="ml-auto text-brand-primary" size={14} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// Badge component for active filters
const Badge = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-brand-light/70 dark:bg-gray-700 text-brand-text dark:text-gray-300 rounded-full border border-brand-light dark:border-gray-600">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-brand-primary dark:hover:text-white transition-colors duration-200"
        aria-label="Remove filter"
      >
        <FaTimes size={12} />
      </button>
    </span>
  )
}

export default JobFilters