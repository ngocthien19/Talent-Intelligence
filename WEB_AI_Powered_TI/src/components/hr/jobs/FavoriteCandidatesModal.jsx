import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaSpinner, FaUser, FaEnvelope, FaPhone, FaCalendar, FaSearch } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import { jobApi } from '~/api/hr/job.api'
import { formatDate } from '~/utils/format'
import Pagination from '~/components/common/Pagination'

const FavoriteCandidatesModal = ({ isOpen, onClose, jobId, jobTitle }) => {
  const { t } = useLanguage()
  const [candidates, setCandidates] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    page: 1,
    totalPages: 0
  })
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (isOpen && jobId) {
      fetchCandidates(1)
    }
  }, [isOpen, jobId])

  const fetchCandidates = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await jobApi.getFavoriteCandidates(jobId, {
        page,
        limit: 20,
        keyword: keyword || undefined
      })

      if (response.success) {
        setCandidates(response.data || [])
        setPagination({
          total: response.pagination?.total || 0,
          limit: response.pagination?.limit || 20,
          page: response.pagination?.page || 1,
          totalPages: response.pagination?.totalPages || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch favorite candidates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setKeyword(searchInput)
    fetchCandidates(1)
  }

  const handlePageChange = (page) => {
    fetchCandidates(page)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setKeyword('')
    fetchCandidates(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-light dark:border-gray-700 flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-brand-secondary dark:text-white">
              {t('hr.job.favoriteCandidates') || 'Ứng viên yêu thích'}
            </h3>
            {jobTitle && (
              <p className="text-sm text-brand-text/60 dark:text-gray-400 mt-0.5">
                {t('hr.job.forJob') || 'Công việc'}: <span className="font-medium text-brand-primary">{jobTitle}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-brand-light dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          >
            <FaTimes size={20} className="text-brand-text/60 dark:text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-brand-light/50 dark:border-gray-700/50 flex-shrink-0">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text/40 dark:text-gray-500" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('hr.job.searchCandidates') || 'Tìm kiếm ứng viên theo tên hoặc email...'}
                className="w-full pl-10 pr-4 py-2 bg-brand-bg dark:bg-gray-800 border border-brand-light dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 dark:placeholder:text-gray-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-brand text-white rounded-lg font-medium hover:shadow-glow transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              {t('common.search') || 'Tìm kiếm'}
            </button>
            {keyword && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 text-brand-text/60 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all duration-200 cursor-pointer"
              >
                {t('common.clear') || 'Xóa'}
              </button>
            )}
          </form>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <FaSpinner className="animate-spin text-brand-primary" size={32} />
                <p className="text-sm text-brand-text/60 dark:text-gray-400">
                  {t('common.loading') || 'Đang tải...'}
                </p>
              </div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-brand-light/20 dark:bg-gray-800 flex items-center justify-center mb-4">
                <FaUser size={32} className="text-brand-light/60 dark:text-gray-600" />
              </div>
              <h4 className="text-lg font-semibold text-brand-secondary dark:text-white mb-1">
                {t('hr.job.noFavoriteCandidates') || 'Chưa có ứng viên yêu thích'}
              </h4>
              <p className="text-sm text-brand-text/60 dark:text-gray-400">
                {keyword
                  ? t('hr.job.noSearchResults') || 'Không tìm thấy ứng viên phù hợp với từ khóa tìm kiếm'
                  : t('hr.job.noFavoriteCandidatesDesc') || 'Chưa có ứng viên nào yêu thích công việc này'
                }
              </p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-brand-text/60 dark:text-gray-400">
                  {t('hr.job.totalCandidates') || 'Tổng số'}:{' '}
                  <span className="font-semibold text-brand-secondary dark:text-white">
                    {pagination.total}
                  </span>{' '}
                  {t('hr.job.candidates') || 'ứng viên'}
                </p>
              </div>

              {/* Candidate List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.candidate_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className="bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl p-4 border border-brand-light/30 dark:border-gray-700/50 hover:border-brand-primary/30 dark:hover:border-brand-primary/30 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {candidate.candidate_avatar?.secure_url ? (
                          <img
                            src={candidate.candidate_avatar.secure_url}
                            alt={candidate.candidate_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-brand-light dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg">
                            {candidate.candidate_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-brand-secondary dark:text-white truncate">
                          {candidate.candidate_name || 'N/A'}
                        </h5>
                        <div className="space-y-1 mt-1">
                          <div className="flex items-center gap-1.5 text-sm text-brand-text/60 dark:text-gray-400 truncate">
                            <FaEnvelope size={12} className="flex-shrink-0" />
                            <span className="truncate">{candidate.candidate_email || 'N/A'}</span>
                          </div>
                          {candidate.candidate_phone && (
                            <div className="flex items-center gap-1.5 text-sm text-brand-text/60 dark:text-gray-400">
                              <FaPhone size={12} className="flex-shrink-0" />
                              <span>{candidate.candidate_phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-brand-text/40 dark:text-gray-500">
                            <FaCalendar size={11} className="flex-shrink-0" />
                            <span>
                              {t('hr.job.favoritedAt') || 'Yêu thích lúc'}:{' '}
                              {candidate.favorited_at ? formatDate(new Date(candidate.favorited_at)) : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Skills */}
                        {candidate.candidate_skills && candidate.candidate_skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.candidate_skills.slice(0, 3).map((skill, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-brand-light/50 dark:bg-gray-700/50 text-brand-text dark:text-gray-300 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.candidate_skills.length > 3 && (
                              <span className="px-2 py-0.5 text-xs text-brand-text/40 dark:text-gray-500">
                                +{candidate.candidate_skills.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default FavoriteCandidatesModal