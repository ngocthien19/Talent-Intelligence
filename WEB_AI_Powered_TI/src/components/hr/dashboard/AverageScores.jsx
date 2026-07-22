import { useLanguage } from '~/hooks/useLanguage'

const AverageScores = ({ scores }) => {
  const { t } = useLanguage()

  const scoreItems = [
    { labelKey: 'hr.overallScore', value: scores?.overall || 0 },
    { labelKey: 'hr.skillsScore', value: scores?.skillsMatch || 0 },
    { labelKey: 'hr.cultureScore', value: scores?.cultureFit || 0 },
    { labelKey: 'hr.retentionScore', value: scores?.retention || 0 }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {scoreItems.map((item, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
        >
          <p className="text-xs text-brand-text/60 dark:text-gray-400">{t(item.labelKey)}</p>
          <p className="text-2xl font-bold text-brand-secondary dark:text-white">{item.value}%</p>
        </div>
      ))}
    </div>
  )
}

export default AverageScores