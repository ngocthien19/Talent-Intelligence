import { useLanguage } from '~/hooks/useLanguage'
import { formatSalary } from '~/utils/format'

const JobDetailSidebar = ({ job, getExperienceLabel }) => {
  const { t } = useLanguage()

  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 border-t-4 border-t-brand-primary sticky top-24 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-brand-primary dark:text-brand-primary transition-colors duration-200">
            {formatSalary(job.salary_range)}
          </div>
          <p className="text-sm text-brand-text/60 dark:text-gray-500 mt-1 transition-colors duration-200">
            {t('jobs.salary') || 'Mức lương'}
          </p>
        </div>

        <div className="space-y-3 text-sm text-brand-text dark:text-gray-400 mb-6">
          <div className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200">
            <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.postedOn') || 'Ngày đăng'}</span>
            <span className="font-medium text-brand-secondary dark:text-white">
              {new Date(job.created_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200">
            <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.type') || 'Loại hình'}</span>
            <span className="font-medium text-brand-secondary dark:text-white">
              {job.employment_type || 'Full-time'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200">
            <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.experience') || 'Kinh nghiệm'}</span>
            <span className="font-medium text-brand-secondary dark:text-white">
              {getExperienceLabel(job.experience_level)}
            </span>
          </div>
          {job.location && (
            <div className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200">
              <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.location') || 'Địa điểm'}</span>
              <span className="font-medium text-brand-secondary dark:text-white">
                {job.location}
              </span>
            </div>
          )}
        </div>

        <button className="w-full px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium transition-all duration-300 cursor-pointer hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]">
          {t('jobs.applyNow') || 'Ứng tuyển ngay'}
        </button>
        <button className="w-full px-6 py-3 mt-3 border border-brand-primary text-brand-primary rounded-xl font-medium transition-all duration-300 cursor-pointer hover:bg-brand-primary hover:!text-white hover:shadow-glow hover:scale-[1.02] active:scale-[0.98]">
          {t('jobs.saveJob') || 'Lưu việc làm'}
        </button>
      </div>
    </div>
  )
}

export default JobDetailSidebar