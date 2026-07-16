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
    <section className="w-full py-20 bg-white dark:bg-slate-900 border-b border-brand-light/50 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <Link
              key={index}
              to={card.to}
              className="action-card group bg-brand-bg/50 dark:bg-gray-800/50 rounded-2xl border border-brand-light/50 dark:border-gray-700 p-8 hover:bg-brand-primary dark:hover:bg-brand-primary hover:border-brand-primary transition-all duration-500 text-center cursor-pointer hover:-translate-y-2 shadow-sm hover:shadow-glow"
            >
              {/* Box Icon: Bình thường nền xanh nhạt, hover thành nền trắng mờ 20% */}
              <div className="action-icon w-16 h-16 bg-brand-light dark:bg-gray-700 group-hover:bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-sm group-hover:shadow-md">
                {/* Icon: Bình thường màu xanh chủ đạo, hover chuyển sang màu trắng */}
                <card.icon
                  className="text-brand-primary dark:text-brand-accent group-hover:text-white transition-colors duration-500"
                  size={28}
                />
              </div>

              {/* Chữ tiêu đề */}
              <h3 className="text-xl font-bold text-brand-secondary dark:text-white group-hover:text-white transition-colors duration-500 mb-3">
                {card.title}
              </h3>

              {/* Chữ mô tả */}
              <p className="text-base text-brand-text dark:text-gray-400 group-hover:text-white/90 dark:group-hover:text-white transition-colors duration-500">
                {card.desc}
              </p>

              {/* Nút Action */}
              <span className="action-arrow inline-block mt-4 text-brand-primary font-semibold text-sm group-hover:!text-white group-hover:translate-x-1 transition-all duration-500">
                {card.action}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ActionCards