import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'
import { formatSalary } from '~/utils/format'
import ApplyJobModal from '~/components/candidate/ApplyJobModal'

const JobDetailSidebar = ({ job, getExperienceLabel }) => {
  const { t } = useLanguage()
  const [showApplyModal, setShowApplyModal] = useState(false)

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lg:col-span-1"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 border-t-4 border-t-brand-primary sticky top-24 transition-all duration-300 hover:shadow-glow dark:hover:shadow-gray-800/50">
          {/* Salary */}
          <motion.div
            custom={0}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-brand-primary dark:text-brand-primary transition-colors duration-200"
            >
              {formatSalary(job.salary_range)}
            </motion.div>
            <p className="text-sm text-brand-text/60 dark:text-gray-500 mt-1 transition-colors duration-200">
              {t('jobs.salary') || 'Mức lương'}
            </p>
          </motion.div>

          {/* Job Info */}
          <div className="space-y-3 text-sm text-brand-text dark:text-gray-400 mb-6">
            <motion.div
              custom={1}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200"
            >
              <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.postedOn') || 'Ngày đăng'}</span>
              <span className="font-medium text-brand-secondary dark:text-white">
                {new Date(job.created_at).toLocaleDateString('vi-VN')}
              </span>
            </motion.div>
            <motion.div
              custom={2}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200"
            >
              <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.type') || 'Loại hình'}</span>
              <span className="font-medium text-brand-secondary dark:text-white">
                {job.employment_type || 'Full-time'}
              </span>
            </motion.div>
            <motion.div
              custom={3}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200"
            >
              <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.experience') || 'Kinh nghiệm'}</span>
              <span className="font-medium text-brand-secondary dark:text-white">
                {getExperienceLabel(job.experience_level)}
              </span>
            </motion.div>
            {job.location && (
              <motion.div
                custom={4}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-between py-2 border-b border-brand-light dark:border-gray-700 transition-colors duration-200"
              >
                <span className="text-brand-text/60 dark:text-gray-500">{t('jobs.location') || 'Địa điểm'}</span>
                <span className="font-medium text-brand-secondary dark:text-white">
                  {job.location}
                </span>
              </motion.div>
            )}
          </div>

          {/* Buttons */}
          <motion.div
            custom={5}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowApplyModal(true)}
              className="w-full px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium transition-all duration-300 cursor-pointer hover:shadow-glow"
            >
              {t('jobs.applyNow') || 'Ứng tuyển ngay'}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Apply Modal */}
      <ApplyJobModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        jobId={job.id}
        jobTitle={job.title}
        companyName={job.company_name}
      />
    </>
  )
}

export default JobDetailSidebar