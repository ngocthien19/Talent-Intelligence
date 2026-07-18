import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { useScrollToTop } from '~/hooks/useScrollToTop'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  FaMicrophone,
  FaStop,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaStar,
  FaArrowLeft,
  FaRobot,
  FaBrain,
  FaChartBar,
  FaLightbulb,
  FaExclamationTriangle
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { mockInterviewApi } from '~/api/candidate/mock-interview.api'

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
}

const questionVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    x: -30,
    transition: {
      duration: 0.3
    }
  }
}

const getCategoryColor = (category) => {
  const colors = {
    technical: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
    behavioral: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
    situational: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
    cultural: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
    general: 'text-gray-500 bg-gray-50 dark:bg-gray-800'
  }
  return colors[category?.toLowerCase()] || colors.general
}

const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: 'text-green-500 bg-green-50 dark:bg-green-950/30',
    medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
    hard: 'text-red-500 bg-red-50 dark:bg-red-950/30'
  }
  return colors[difficulty?.toLowerCase()] || colors.medium
}

const MockInterview = () => {
  useScrollToTop()
  const { t } = useLanguage()
  const { isAuthenticated, user } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [isAnswering, setIsAnswering] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [result, setResult] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const textareaRef = useRef(null)

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('Vui lòng đăng nhập để sử dụng tính năng này')
    }
  }, [isAuthenticated])

  // Tải lịch sử
  const loadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await mockInterviewApi.getHistory({ limit: 10 })
      if (response.success) {
        setHistory(response.data || [])
      }
    } catch (error) {
      console.error('Load history error:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory()
    }
  }, [isAuthenticated])

  // Bắt đầu phỏng vấn
  const startInterview = async () => {
    setIsLoading(true)
    try {
      const response = await mockInterviewApi.startSession({
        candidateId: user?.id,
        jobId: null,
        numberOfQuestions: 5
      })

      if (response.success) {
        setSession(response.data.session)
        setQuestions(response.data.questions || [])
        setCurrentQuestionIndex(0)
        setAnswers([])
        setIsEnded(false)
        setResult(null)
        toast.success('Bắt đầu phỏng vấn thành công!')
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể bắt đầu phỏng vấn')
    } finally {
      setIsLoading(false)
    }
  }

  // Gửi câu trả lời
  const submitAnswer = async () => {
    const answerText = textareaRef.current?.value?.trim()
    if (!answerText) {
      toast.warning('Vui lòng nhập câu trả lời')
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return

    setIsAnswering(true)
    try {
      const response = await mockInterviewApi.answerQuestion({
        sessionId: session.id,
        questionId: currentQuestion.id,
        answer: answerText
      })

      if (response.success) {
        // Lưu câu trả lời
        setAnswers([...answers, {
          question: currentQuestion,
          answer: answerText,
          feedback: response.data.answer?.feedback,
          score: response.data.answer?.score
        }])

        // Reset textarea
        if (textareaRef.current) {
          textareaRef.current.value = ''
        }

        // Kiểm tra hoàn thành
        if (response.data.isComplete) {
          setIsEnded(true)
          // Lấy kết quả
          const resultResponse = await mockInterviewApi.getSessionDetail(session.id)
          if (resultResponse.success) {
            setResult(resultResponse.data)
          }
          toast.success('🎉 Hoàn thành phỏng vấn!')
        } else {
          // Chuyển sang câu hỏi tiếp theo
          setCurrentQuestionIndex(currentQuestionIndex + 1)
          toast.success('Đã lưu câu trả lời!')
        }
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi câu trả lời')
    } finally {
      setIsAnswering(false)
    }
  }

  // Xem chi tiết session cũ
  const viewSessionDetail = async (sessionId) => {
    try {
      const response = await mockInterviewApi.getSessionDetail(sessionId)
      if (response.success) {
        setResult(response.data)
        setShowHistory(false)
      }
    } catch (error) {
      toast.error('Không thể tải chi tiết phiên phỏng vấn')
    }
  }

  // Kết thúc phỏng vấn sớm
  const endInterviewEarly = async () => {
    if (!confirm('Bạn có chắc muốn kết thúc phỏng vấn sớm?')) return

    try {
      const response = await mockInterviewApi.endSession(session.id)
      if (response.success) {
        setIsEnded(true)
        setResult(response.data)
        toast.success('Đã kết thúc phỏng vấn')
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể kết thúc phỏng vấn')
    }
  }

  // Reset để bắt đầu lại
  const resetInterview = () => {
    setSession(null)
    setQuestions([])
    setCurrentQuestionIndex(0)
    setAnswers([])
    setIsEnded(false)
    setResult(null)
    if (textareaRef.current) {
      textareaRef.current.value = ''
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container py-6 animate-fade-in">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-custom p-12 text-center">
          <FaRobot size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-secondary dark:text-white mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-brand-text dark:text-gray-400 mb-6">
            Đăng nhập để sử dụng tính năng Mock Interview
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('auth.login') || 'Đăng nhập'}
          </Link>
        </div>
      </div>
    )
  }

  // Hiển thị lịch sử
  if (showHistory) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="app-container py-6"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-brand-secondary dark:text-white flex items-center gap-3 after:content-[''] after:hidden sm:after:inline-block after:w-16 md:after:w-24 after:h-[6px] after:bg-brand-primary/60 after:rounded-full">
                <FaRobot size={24} className="text-brand-primary" />
                Lịch sử phỏng vấn
              </h1>
            </div>
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaArrowLeft size={14} />
              Quay lại
            </button>
          </div>

          {/* History List */}
          {isLoadingHistory ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 skeleton-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 border-l-4 border-brand-primary hover:shadow-glow transition-all duration-300 cursor-pointer"
                  onClick={() => viewSessionDetail(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-brand-light/30 dark:bg-gray-700/30">
                        <FaBrain size={20} className="text-brand-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-brand-secondary dark:text-white">
                          Phỏng vấn {new Date(item.created_at).toLocaleDateString('vi-VN')}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-brand-text/60 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <FaClock size={12} />
                            {new Date(item.created_at).toLocaleTimeString('vi-VN')}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaChartBar size={12} />
                            {item.answered_count || 0}/{item.total_questions} câu
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            item.status === 'completed'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {item.status === 'completed' ? 'Đã hoàn thành' : 'Đang thực hiện'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-brand-primary">
                        Xem chi tiết →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-12 text-center">
              <FaRobot size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-brand-secondary dark:text-white mb-2">
                Chưa có lịch sử phỏng vấn
              </h3>
              <p className="text-brand-text dark:text-gray-400 mb-6">
                Hãy bắt đầu một phiên phỏng vấn để luyện tập
              </p>
              <button
                onClick={() => setShowHistory(false)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                Bắt đầu ngay
              </button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  // Hiển thị kết quả
  if (result && isEnded) {
    const summary = result.summary || {}
    const avgScore = summary.avgScore || 0

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="app-container py-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom overflow-hidden">
            <div className={`h-1 w-full ${avgScore >= 7 ? 'bg-green-500' : avgScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`} />

            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-brand-light/30 dark:bg-gray-700/30">
                    <FaCheckCircle size={24} className="text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-brand-secondary dark:text-white">
                      Kết quả phỏng vấn
                    </h2>
                    <p className="text-sm text-brand-text/60 dark:text-gray-400">
                      Hoàn thành {summary.answeredCount || 0}/{summary.totalQuestions || 0} câu hỏi
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetInterview}
                  className="px-4 py-2 text-sm font-medium text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary hover:!text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  Phỏng vấn lại
                </button>
              </div>

              {/* Score */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-brand-primary">{avgScore}</p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">Điểm trung bình</p>
                </div>
                <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-brand-secondary dark:text-white">
                    {summary.answeredCount || 0}/{summary.totalQuestions || 0}
                  </p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">Số câu đã trả lời</p>
                </div>
                <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-emerald-500">{summary.strengths?.length || 0}</p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">Điểm mạnh</p>
                </div>
                <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl text-center">
                  <p className="text-3xl font-bold text-red-500">{summary.weaknesses?.length || 0}</p>
                  <p className="text-xs text-brand-text/60 dark:text-gray-400">Điểm cần cải thiện</p>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-4">
                {summary.strengths?.length > 0 && (
                  <div className="p-4 bg-green-50/50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800/30">
                    <h3 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2 mb-2">
                      <FaLightbulb size={16} />
                      Điểm mạnh
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-brand-text dark:text-gray-300">
                      {summary.strengths.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.weaknesses?.length > 0 && (
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800/30">
                    <h3 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2 mb-2">
                      <FaExclamationTriangle size={16} />
                      Điểm cần cải thiện
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-brand-text dark:text-gray-300">
                      {summary.weaknesses.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.suggestions?.length > 0 && (
                  <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800/30">
                    <h3 className="font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
                      <FaChartBar size={16} />
                      Gợi ý cải thiện
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-brand-text dark:text-gray-300">
                      {summary.suggestions.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Answers Review */}
              {result.questions && result.questions.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-brand-primary hover:text-brand-secondary dark:hover:text-white font-medium transition-colors duration-200 cursor-pointer"
                  >
                    Xem lịch sử phỏng vấn →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // Hiển thị phỏng vấn đang diễn ra
  if (session && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex]
    const totalQuestions = questions.length
    const progress = Math.round((currentQuestionIndex / totalQuestions) * 100)

    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="app-container py-6"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-brand-secondary dark:text-white flex items-center gap-3">
                <FaRobot size={24} className="text-brand-primary" />
                Phỏng vấn thử
              </h1>
              <p className="text-sm text-brand-text/60 dark:text-gray-400">
                Câu {currentQuestionIndex + 1}/{totalQuestions}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
                />
              </div>
              <span className="text-sm font-medium text-brand-primary">{progress}%</span>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  index < currentQuestionIndex
                    ? 'bg-green-500'
                    : index === currentQuestionIndex
                      ? 'bg-brand-primary'
                      : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              variants={questionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white dark:bg-gray-800 rounded-xl shadow-custom p-6 md:p-8 mb-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-lg bg-brand-light/30 dark:bg-gray-700/30">
                  <FaBrain size={20} className="text-brand-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(currentQuestion.category)}`}>
                      {currentQuestion.category || 'General'}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDifficultyColor(currentQuestion.difficulty)}`}>
                      {currentQuestion.difficulty || 'Medium'}
                    </span>
                  </div>
                  <p className="text-lg font-medium text-brand-secondary dark:text-white">
                    {currentQuestion.question}
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="mt-4">
                <textarea
                  ref={textareaRef}
                  placeholder="Nhập câu trả lời của bạn tại đây..."
                  rows={5}
                  disabled={isAnswering}
                  className="w-full px-4 py-3 bg-brand-bg dark:bg-gray-900 border border-brand-light dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-transparent transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-brand-text/40 dark:text-gray-500">
                    Nhấn Ctrl+Enter để gửi
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={submitAnswer}
              disabled={isAnswering}
              className="flex-1 px-6 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnswering ? (
                <>
                  <FaSpinner className="animate-spin" size={18} />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <FaMicrophone size={18} />
                  Gửi câu trả lời
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={endInterviewEarly}
              className="px-6 py-3 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaStop size={18} className="inline mr-2" />
              Kết thúc
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Landing page - Bắt đầu phỏng vấn
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="app-container py-6"
    >
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-custom overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-brand-primary to-brand-accent" />

          <div className="p-6 md:p-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-24 h-24 mx-auto rounded-full bg-brand-light/30 dark:bg-gray-700/30 flex items-center justify-center mb-6"
            >
              <FaRobot size={40} className="text-brand-primary" />
            </motion.div>

            <h1 className="text-3xl font-extrabold text-brand-secondary dark:text-white mb-3">
              Phỏng vấn thử với AI
            </h1>
            <p className="text-brand-text dark:text-gray-400 max-w-2xl mx-auto mb-8">
              Luyện tập phỏng vấn với AI, nhận phản hồi chi tiết và cải thiện kỹ năng của bạn.
              Bạn sẽ được hỏi 5 câu hỏi phỏng vấn và nhận đánh giá ngay lập tức.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl">
                <FaBrain size={24} className="text-brand-primary mx-auto mb-2" />
                <h3 className="font-medium text-brand-secondary dark:text-white">5 câu hỏi</h3>
                <p className="text-xs text-brand-text/60 dark:text-gray-400">Đa dạng chủ đề</p>
              </div>
              <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl">
                <FaStar size={24} className="text-yellow-500 mx-auto mb-2" />
                <h3 className="font-medium text-brand-secondary dark:text-white">Đánh giá ngay</h3>
                <p className="text-xs text-brand-text/60 dark:text-gray-400">Phản hồi chi tiết</p>
              </div>
              <div className="p-4 bg-brand-bg/50 dark:bg-gray-800/50 rounded-xl">
                <FaChartBar size={24} className="text-emerald-500 mx-auto mb-2" />
                <h3 className="font-medium text-brand-secondary dark:text-white">Theo dõi tiến bộ</h3>
                <p className="text-xs text-brand-text/60 dark:text-gray-400">Lịch sử phỏng vấn</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startInterview}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" size={18} />
                    Đang bắt đầu...
                  </>
                ) : (
                  <>
                    <FaMicrophone size={18} />
                    Bắt đầu phỏng vấn
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHistory(true)}
                className="px-8 py-3 border border-brand-primary text-brand-primary rounded-xl font-medium hover:bg-brand-primary hover:!text-white transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <FaClock size={18} className="inline mr-2" />
                Lịch sử phỏng vấn
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default MockInterview