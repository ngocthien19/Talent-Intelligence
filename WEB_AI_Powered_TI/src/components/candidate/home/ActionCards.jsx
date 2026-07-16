import { Link } from 'react-router-dom'
import { useLanguage } from '~/hooks/useLanguage'
import { FaSearch, FaUpload, FaRobot } from 'react-icons/fa'

const ActionCards = () => {
  const { t } = useLanguage()

  const cards = [
    {
      to: '/jobs',
      icon: FaSearch,
      title: t('home.findJobs') || 'Tìm việc làm',
      desc: t('home.findJobsDesc') || 'Khám phá hàng ngàn cơ hội việc làm phù hợp với kỹ năng của bạn',
      action: t('home.exploreNow') || 'Khám phá ngay →'
    },
    {
      to: '/upload-cv',
      icon: FaUpload,
      title: t('home.uploadCV') || 'Upload CV',
      desc: t('home.uploadCVDesc') || 'Tải lên CV để AI phân tích và gợi ý công việc phù hợp nhất với bạn',
      action: t('home.uploadNow') || 'Tải lên ngay →'
    },
    {
      to: '/mock-interview',
      icon: FaRobot,
      title: t('home.mockInterview') || 'Mock Interview',
      desc: t('home.mockInterviewDesc') || 'Luyện tập phỏng vấn với AI, nhận phản hồi và cải thiện kỹ năng của bạn',
      action: t('home.tryNow') || 'Thử ngay →'
    }
  ]

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.to}
            className="action-card group bg-white dark:bg-gray-800 rounded-xl shadow-custom dark:shadow-gray-800/30 p-6 hover:shadow-glow dark:hover:shadow-gray-800/50 transition-all duration-300 text-center cursor-pointer"
          >
            <div className="action-icon w-14 h-14 bg-gradient-brand rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <card.icon className="text-white" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
              {card.title}
            </h3>
            <p className="text-sm text-brand-text dark:text-gray-400">
              {card.desc}
            </p>
            <span className="action-arrow inline-block mt-3 text-brand-primary font-medium text-sm group-hover:translate-x-1 transition-transform duration-300 cursor-pointer">
              {card.action}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default ActionCards