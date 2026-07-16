import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { categoryApi } from '~/api/candidate/category.api'
import { FaSearch, FaMapMarkerAlt, FaTag, FaCheck } from 'react-icons/fa'

const SearchForm = () => {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  const [searchCategory, setSearchCategory] = useState('')
  const [isLocationOpen, setIsLocationOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const locationRef = useRef(null)
  const categoryRef = useRef(null)

  // Danh sách thành phố
  const locations = [
    { value: '', label: 'Tất cả địa điểm' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'TP. Hồ Chí Minh', label: 'TP. Hồ Chí Minh' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Hải Phòng', label: 'Hải Phòng' },
    { value: 'Cần Thơ', label: 'Cần Thơ' },
    { value: 'Nha Trang', label: 'Nha Trang' },
    { value: 'Huế', label: 'Huế' },
    { value: 'Vũng Tàu', label: 'Vũng Tàu' },
    { value: 'Đà Lạt', label: 'Đà Lạt' },
    { value: 'Biên Hòa', label: 'Biên Hòa' },
    { value: 'Bình Dương', label: 'Bình Dương' }
  ]

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getDropdown()
        if (response.success) {
          setCategories([{ id: '', name: 'Tất cả danh mục' }, ...response.data])
        }
      } catch (error) {
        console.error('Fetch categories error:', error)
      } finally {
        setIsCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setIsLocationOpen(false)
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchKeyword) params.append('keyword', searchKeyword)
    if (searchLocation) params.append('location', searchLocation)
    if (searchCategory) params.append('category', searchCategory)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="search-form flex flex-col md:flex-row gap-3 max-w-4xl mx-auto bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-glow border border-brand-light dark:border-gray-700 transition-all duration-300">
      {/* Search Input */}
      <div className="flex-1 relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-400" size={18} />
        <input
          type="text"
          placeholder={t('home.searchPlaceholder') || 'Tìm kiếm việc làm...'}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-transparent dark:bg-transparent border-0 focus:ring-0 focus:outline-none text-brand-secondary dark:text-white placeholder:text-brand-text/40 transition-colors duration-300"
        />
      </div>

      {/* Divider */}
      <div className="hidden md:flex items-center text-brand-border dark:text-gray-600 select-none">
        <span className="text-2xl font-light opacity-50">|</span>
      </div>

      {/* Category Dropdown */}
      <div ref={categoryRef} className="relative md:w-44">
        <button
          type="button"
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="w-full flex items-center gap-2 px-4 py-3 text-left bg-transparent dark:bg-transparent border-0 focus:ring-0 focus:outline-none text-brand-secondary dark:text-white hover:bg-brand-light/20 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-200 cursor-pointer"
        >
          <FaTag className="text-brand-text/40 dark:text-gray-400 flex-shrink-0" size={18} />
          <span className="flex-1 truncate">
            {searchCategory
              ? categories.find(c => c.id === searchCategory)?.name || 'Danh mục'
              : (t('home.categoryPlaceholder') || 'Danh mục')}
          </span>
          <svg
            className={`w-4 h-4 text-brand-text/40 dark:text-gray-400 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isCategoryOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-bold border border-brand-light dark:border-gray-700 py-1 animate-fade-in">
            {isCategoriesLoading ? (
              <div className="px-4 py-3 text-sm text-brand-text/60 dark:text-gray-400">
                Đang tải...
              </div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id || 'all'}
                  type="button"
                  onClick={() => {
                    setSearchCategory(category.id || '')
                    setIsCategoryOpen(false)
                  }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-brand-light dark:hover:bg-gray-700 cursor-pointer ${
                    searchCategory === category.id
                      ? 'text-brand-primary bg-brand-light/50 dark:bg-gray-700/50 font-medium'
                      : 'text-brand-secondary dark:text-gray-300'
                  }`}
                >
                  {category.name}
                  {searchCategory === category.id && (
                    <FaCheck className="float-right mt-0.5 text-brand-primary" size={14} />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="hidden md:flex items-center text-brand-border dark:text-gray-600 select-none">
        <span className="text-2xl font-light opacity-50">|</span>
      </div>

      {/* Location Dropdown */}
      <div ref={locationRef} className="relative md:w-44">
        <button
          type="button"
          onClick={() => setIsLocationOpen(!isLocationOpen)}
          className="w-full flex items-center gap-2 px-4 py-3 text-left bg-transparent dark:bg-transparent border-0 focus:ring-0 focus:outline-none text-brand-secondary dark:text-white hover:bg-brand-light/20 dark:hover:bg-gray-700/50 rounded-xl transition-colors duration-200 cursor-pointer"
        >
          <FaMapMarkerAlt className="text-brand-text/40 dark:text-gray-400 flex-shrink-0" size={18} />
          <span className="flex-1 truncate">
            {searchLocation || (t('home.locationPlaceholder') || 'Địa điểm...')}
          </span>
          <svg
            className={`w-4 h-4 text-brand-text/40 dark:text-gray-400 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isLocationOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-bold border border-brand-light dark:border-gray-700 py-1 animate-fade-in">
            {locations.map((location) => (
              <button
                key={location.value}
                type="button"
                onClick={() => {
                  setSearchLocation(location.value)
                  setIsLocationOpen(false)
                }}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors duration-200 hover:bg-brand-light dark:hover:bg-gray-700 cursor-pointer ${
                  searchLocation === location.value
                    ? 'text-brand-primary bg-brand-light/50 dark:bg-gray-700/50 font-medium'
                    : 'text-brand-secondary dark:text-gray-300'
                }`}
              >
                {location.label}
                {searchLocation === location.value && (
                  <FaCheck className="float-right mt-0.5 text-brand-primary" size={14} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="search-btn px-8 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 whitespace-nowrap cursor-pointer hover:scale-[1.02]"
      >
        {t('home.search') || 'Tìm kiếm'}
      </button>
    </form>
  )
}

export default SearchForm