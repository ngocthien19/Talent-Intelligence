import { motion } from 'framer-motion'
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa'
import { useLanguage } from '~/hooks/useLanguage'
import CandidateStatusBadge from '~/components/hr/candidate/CandidateStatusBadge'
import { formatDate } from '~/utils/format'

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

const CandidateDetailHeader = ({ candidate }) => {
  const { t } = useLanguage()

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border border-brand-light/30 dark:border-gray-700/50 hover:shadow-glow transition-all duration-300"
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {candidate.avatar ? (
            <img
              src={candidate.avatar.secure_url}
              alt={candidate.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-brand-light/50 dark:border-gray-700"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold">
              {candidate.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-secondary dark:text-white">
                {candidate.name || 'Chưa có tên'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <CandidateStatusBadge status={candidate.status} />
                <span className="text-sm text-brand-text/60 dark:text-gray-400">
                  {t('hr.candidate.detail.applied')}: {candidate.created_at ? formatDate(new Date(candidate.created_at)) : '--'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium px-3 py-1 bg-brand-light/20 dark:bg-gray-700/30 rounded-full text-brand-text/60 dark:text-gray-400">
                ID: {candidate.id?.slice(0, 8) || '--'}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {candidate.email && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400">
                <FaEnvelope size={14} className="text-brand-primary" />
                <a href={`mailto:${candidate.email}`} className="hover:text-brand-primary transition-colors">
                  {candidate.email}
                </a>
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400">
                <FaPhone size={14} className="text-brand-primary" />
                <a href={`tel:${candidate.phone}`} className="hover:text-brand-primary transition-colors">
                  {candidate.phone}
                </a>
              </div>
            )}
            {candidate.address && (
              <div className="flex items-center gap-2 text-sm text-brand-text/60 dark:text-gray-400 col-span-1 sm:col-span-2">
                <FaMapMarkerAlt size={14} className="text-brand-primary" />
                <span>{candidate.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CandidateDetailHeader