import { motion } from 'framer-motion'
import { FaTags, FaCheck, FaTimes } from 'react-icons/fa'
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

const CandidateDetailSkills = ({ candidate }) => {
  const { t } = useLanguage()

  const requiredSkills = candidate.required_skills || []
  const niceToHaveSkills = candidate.nice_to_have_skills || []

  if (requiredSkills.length === 0 && niceToHaveSkills.length === 0) {
    return null
  }

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
    >
      <h2 className="text-lg font-bold text-brand-secondary dark:text-white mb-4 flex items-center gap-2">
        <FaTags size={18} className="text-brand-primary" />
        {t('hr.candidate.skills') || 'Kỹ năng'}
      </h2>

      <div className="space-y-4">
        {/* Required skills */}
        {requiredSkills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mb-2">
              {t('hr.candidate.requiredSkills') || 'Kỹ năng bắt buộc'}
            </p>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <FaCheck size={10} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nice to have skills */}
        {niceToHaveSkills.length > 0 && (
          <div>
            <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mb-2">
              {t('hr.candidate.niceToHaveSkills') || 'Kỹ năng thêm'}
            </p>
            <div className="flex flex-wrap gap-2">
              {niceToHaveSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-600 dark:bg-gray-700/30 dark:text-gray-400 rounded-lg transition-all duration-200 hover:scale-105"
                >
                  <FaTimes size={10} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default CandidateDetailSkills