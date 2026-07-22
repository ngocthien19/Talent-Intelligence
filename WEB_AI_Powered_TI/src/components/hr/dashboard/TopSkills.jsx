import { FaTags, FaTrophy } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const TopSkills = ({ topSkills }) => {
  const { t } = useLanguage()
  const hasTopSkills = Array.isArray(topSkills) && topSkills.length > 0
  const maxSkillCount = hasTopSkills ? Math.max(...topSkills.map((s) => s.count || 0)) : 0

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-200">
      <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
        <FaTags size={16} className="text-brand-primary" />
        {t('hr.topSkills') || 'Kỹ năng nổi bật'}
      </h2>
      {hasTopSkills ? (
        <div className="space-y-3">
          {topSkills.slice(0, 8).map((skill, index) => (
            <div key={`${skill.skill}-${index}`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-brand-text dark:text-gray-300 truncate flex items-center gap-1.5">
                  {index === 0 && <FaTrophy size={11} className="text-amber-400 flex-shrink-0" />}
                  {skill.skill}
                </span>
                <span className="font-medium text-brand-secondary dark:text-white flex-shrink-0 ml-2">
                  {skill.count}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-primary rounded-full transition-all duration-500"
                  style={{ width: maxSkillCount > 0 ? `${(skill.count / maxSkillCount) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-brand-text/60 dark:text-gray-400">
          <p className="text-sm">{t('common.noData') || 'Chưa có dữ liệu kỹ năng'}</p>
        </div>
      )}
    </div>
  )
}

export default TopSkills