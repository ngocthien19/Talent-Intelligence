import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { motion } from 'framer-motion'
import { FaRobot, FaRocket, FaUpload, FaComments, FaArrowRight } from 'react-icons/fa'

const CTASection = () => {
  const { t } = useLanguage()

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6 }}
      className="w-full py-24 bg-white dark:bg-slate-900 border-t border-brand-light/50 dark:border-gray-800"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative cta-section rounded-[2rem] overflow-hidden p-8 md:p-16 text-center text-white shadow-2xl"
        >
          {/* Background Image */}
          <motion.div
            initial={{ scale: 1.1 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
            style={{ backgroundImage: 'url(\'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop\')' }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-brand-primary via-brand-primary/90 to-brand-accent"></div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-4 mb-6 bg-white/10 p-4 rounded-full backdrop-blur-md border border-white/20"
            >
              <motion.span
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FaRobot className="text-4xl text-white" />
              </motion.span>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FaRocket className="text-4xl text-brand-light" />
              </motion.span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-3xl md:text-5xl font-extrabold mb-5 tracking-tight drop-shadow-sm"
            >
              {t('home.ctaTitle') || 'Để AI giúp bạn tìm việc phù hợp nhất'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
            >
              {t('home.ctaDesc') || 'Upload CV của bạn, AI sẽ phân tích và gợi ý những công việc phù hợp nhất với kỹ năng và kinh nghiệm của bạn.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/upload-cv"
                  className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-primary rounded-xl font-bold hover:shadow-glow hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full sm:w-auto"
                >
                  <FaUpload size={18} />
                  {t('home.uploadCV') || 'Upload CV ngay'}
                  <motion.span
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaArrowRight size={16} />
                  </motion.span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/mock-interview"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent text-white border-2 border-white/60 rounded-xl font-bold hover:bg-white/10 hover:border-white hover:-translate-y-1 transition-all duration-300 cursor-pointer w-full sm:w-auto"
                >
                  <FaComments size={18} />
                  {t('home.tryMockInterview') || 'Thử Mock Interview'}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}

export default CTASection