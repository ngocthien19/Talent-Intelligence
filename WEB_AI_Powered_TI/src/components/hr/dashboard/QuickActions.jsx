import { Link } from 'react-router-dom'
import { FaPlus, FaSearch, FaCalendarAlt } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'

const QUICK_ACTIONS = [
  {
    to: '/hr/jobs/new',
    icon: FaPlus,
    titleKey: 'hr.postNewJob',
    descKey: 'hr.postNewJobDesc',
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10'
  },
  {
    to: '/hr/search',
    icon: FaSearch,
    titleKey: 'hr.searchCandidates',
    descKey: 'hr.searchCandidatesDesc',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10'
  },
  {
    to: '/hr/interviews',
    icon: FaCalendarAlt,
    titleKey: 'hr.manageInterviews',
    descKey: 'hr.manageInterviewsDesc',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
]

const QuickActions = () => {
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 md:p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow hover:-translate-y-1 transition-all duration-200">
      <h2 className="text-base md:text-lg font-bold text-brand-secondary dark:text-white mb-4">
        {t('hr.quickActions')}
      </h2>
      <div className="space-y-3">
        {QUICK_ACTIONS.map((action, index) => (
          <div
            key={index}
            className="hover:scale-[1.02] active:scale-95 transition-all duration-200"
          >
            <Link
              to={action.to}
              className="flex items-center gap-3 p-3 rounded-xl bg-brand-light/20 dark:bg-gray-700/30 hover:bg-brand-light/40 dark:hover:bg-gray-700/50 transition-all duration-200 group cursor-pointer"
            >
              <div className={`p-2 rounded-lg ${action.bg} ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                <action.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-brand-secondary dark:text-white">{t(action.titleKey)}</p>
                <p className="text-xs text-brand-text/60 dark:text-gray-400">{t(action.descKey)}</p>
              </div>
              <span className={`text-brand-text/40 ${action.color.replace('text-', 'group-hover:text-')} transition-colors duration-200 group-hover:translate-x-1 transform`}>→</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickActions