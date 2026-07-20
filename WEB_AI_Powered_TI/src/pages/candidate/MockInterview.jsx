import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '~/hooks/useLanguage'
import { useAuth } from '~/hooks/useAuth'
import { mockInterviewApi } from '~/api/candidate/mock-interview.api'
import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaSpinner,
  FaHistory,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaCommentDots
} from 'react-icons/fa'
import { toast } from 'react-toastify'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
}

const fadeInUp = {
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

const MockInterviewChat = () => {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()

  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Lưu session ID vào localStorage
  const saveCurrentSessionId = (sessionId) => {
    if (sessionId) {
      localStorage.setItem('mockInterview_currentSessionId', sessionId)
    } else {
      localStorage.removeItem('mockInterview_currentSessionId')
    }
  }

  const getStoredSessionId = () => {
    return localStorage.getItem('mockInterview_currentSessionId')
  }

  // Tự động scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input
  useEffect(() => {
    if (currentSession) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [currentSession])

  // Load danh sách phiên
  const loadSessions = async () => {
    try {
      const response = await mockInterviewApi.getSessions()
      if (response.success) {
        setSessions(response.data || [])
        return response.data || []
      }
      return []
    } catch (error) {
      console.error('Load sessions error:', error)
      return []
    }
  }

  // Load chi tiết phiên (bao gồm tin nhắn)
  const loadSessionDetail = async (sessionId) => {
    setIsLoading(true)
    try {
      const response = await mockInterviewApi.getSessionDetail(sessionId)
      if (response.success && response.data) {
        const session = response.data
        if (session.messages && session.messages.length > 0) {
          setMessages(session.messages)
        } else {
          const historyResponse = await mockInterviewApi.getChatHistory(sessionId)
          if (historyResponse.success) {
            setMessages(historyResponse.data || [])
          }
        }
        setCurrentSession(session)
        saveCurrentSessionId(sessionId)
        return session
      }
      return null
    } catch (error) {
      console.error('Load session detail error:', error)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Tạo phiên mới
  const createNewSession = async () => {
    setIsCreatingSession(true)
    try {
      const response = await mockInterviewApi.createSession()
      if (response.success) {
        const session = response.data.session

        // Reset messages trước khi set session mới
        setMessages([])

        // Set session mới với status in_progress
        const newSession = {
          ...session,
          status: 'in_progress'
        }
        setCurrentSession(newSession)
        saveCurrentSessionId(newSession.id)

        // Tin nhắn chào mừng
        const welcomeMsg = {
          id: `welcome-${Date.now()}`,
          sender: 'ai',
          message: response.data.welcomeMessage || 'Chào bạn! Tôi là trợ lý phỏng vấn AI. Hãy bắt đầu bằng cách giới thiệu về bản thân bạn nhé!',
          created_at: new Date()
        }
        setMessages([welcomeMsg])

        // Cập nhật danh sách sessions
        await loadSessions()
        toast.success('Đã tạo phiên phỏng vấn mới')

        // Focus vào input
        setTimeout(() => inputRef.current?.focus(), 100)

        return newSession
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể tạo phiên phỏng vấn')
    } finally {
      setIsCreatingSession(false)
    }
  }

  // Chọn phiên cũ
  const selectSession = async (session) => {
    if (currentSession?.id === session.id) return
    setCurrentSession(null)
    setMessages([])
    await loadSessionDetail(session.id)
  }

  // Gửi tin nhắn
  const sendMessage = async () => {
    const message = input.trim()
    if (!message || !currentSession || isSending) return

    // Kiểm tra nếu session đã completed thì không cho gửi
    if (currentSession.status === 'completed') {
      toast.warning('Phiên này đã kết thúc. Vui lòng tạo phiên mới để tiếp tục.')
      return
    }

    setInput('')
    setIsSending(true)

    const tempId = `temp-${Date.now()}`
    const userMessage = {
      id: tempId,
      sender: 'user',
      message: message,
      created_at: new Date(),
      isTemp: true
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await mockInterviewApi.sendMessage(
        currentSession.id,
        message
      )

      if (response.success) {
        setMessages(prev => {
          const updated = prev.map(msg =>
            msg.id === tempId
              ? { ...msg, isTemp: false }
              : msg
          )
          return [...updated, response.data.message]
        })
        setCurrentSession(response.data.session)
        saveCurrentSessionId(response.data.session?.id || currentSession.id)
        await loadSessions()
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi tin nhắn')
      setMessages(prev => prev.filter(msg => msg.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }

  // Kết thúc phỏng vấn
  const endInterview = async () => {
    if (!currentSession) return
    if (currentSession.status === 'completed') {
      toast.info('Phiên này đã kết thúc')
      return
    }
    if (!confirm('Bạn có chắc muốn kết thúc phỏng vấn?')) return

    setIsLoading(true)
    try {
      const response = await mockInterviewApi.endSession(currentSession.id)
      if (response.success) {
        toast.success('Đã kết thúc phỏng vấn')
        const session = response.data.session
        setCurrentSession(session)
        saveCurrentSessionId(session.id)

        if (response.data.summary?.message) {
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'ai',
            message: response.data.summary.message,
            created_at: new Date(),
            metadata: { type: 'summary' }
          }])
        }

        await loadSessions()
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể kết thúc phỏng vấn')
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa phiên
  const deleteSession = async (sessionId, e) => {
    e?.stopPropagation()
    if (!confirm('Bạn có chắc muốn xóa phiên phỏng vấn này?')) return

    try {
      await mockInterviewApi.deleteSession(sessionId)
      await loadSessions()
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
        setMessages([])
        localStorage.removeItem('mockInterview_currentSessionId')
        // Tự động tạo phiên mới nếu không còn phiên nào
        const remainingSessions = sessions.filter(s => s.id !== sessionId)
        if (remainingSessions.length === 0) {
          await createNewSession()
        }
      }
      toast.success('Đã xóa phiên phỏng vấn')
    } catch (error) {
      toast.error('Không thể xóa phiên phỏng vấn')
    }
  }

  // Khởi tạo
  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) return

      const sessionList = await loadSessions()
      const storedSessionId = getStoredSessionId()

      // Nếu có session ID trong localStorage
      if (storedSessionId) {
        const sessionExists = sessionList.some(s => s.id === storedSessionId)
        if (sessionExists) {
          await loadSessionDetail(storedSessionId)
          setIsInitialized(true)
          return
        }
      }

      // Nếu có session trong danh sách (ưu tiên session đang diễn ra)
      if (sessionList.length > 0) {
        const activeSession = sessionList.find(s => s.status === 'in_progress')
        const firstSession = activeSession || sessionList[0]
        await loadSessionDetail(firstSession.id)
        setIsInitialized(true)
        return
      }

      // Không có session nào, tạo mới
      await createNewSession()
      setIsInitialized(true)
    }

    init()
  }, [isAuthenticated])

  // Xử lý phím Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="app-container py-6"
      >
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-custom p-12 text-center">
          <FaRobot size={48} className="text-brand-light/60 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-secondary dark:text-white mb-2">
            Vui lòng đăng nhập
          </h2>
          <p className="text-brand-text dark:text-gray-400">
            Đăng nhập để sử dụng tính năng phỏng vấn thử với AI
          </p>
        </div>
      </motion.div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="app-container py-6 h-[calc(100vh-120px)] flex items-center justify-center">
        <FaSpinner className="animate-spin text-brand-primary" size={40} />
      </div>
    )
  }

  // Phân loại session
  const activeSessions = sessions.filter(s => s.status === 'in_progress')
  const completedSessions = sessions.filter(s => s.status === 'completed')

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="app-container py-6 h-[calc(100vh-120px)]"
    >
      <div className="max-w-6xl mx-auto h-full flex gap-4">
        {/* Sidebar - Luôn hiển thị */}
        <div className="w-80 flex-shrink-0 h-full bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="font-semibold text-brand-secondary dark:text-white flex items-center gap-2">
              <FaHistory size={16} className="text-brand-primary" />
              Lịch sử chat
            </h3>
            <span className="text-xs text-brand-text/60 dark:text-gray-400">
              {sessions.length} phiên
            </span>
          </div>

          {/* Create New Session Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createNewSession}
            disabled={isCreatingSession}
            className="w-full px-4 py-2.5 bg-gradient-brand text-white rounded-lg font-medium hover:shadow-glow transition-all duration-200 flex items-center justify-center gap-2 mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isCreatingSession ? (
              <FaSpinner className="animate-spin" size={14} />
            ) : (
              <FaPlus size={14} />
            )}
            Phiên mới
          </motion.button>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {/* Active Sessions */}
            {activeSessions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mb-2 flex items-center gap-1">
                  <FaClock size={12} />
                  Đang diễn ra ({activeSessions.length})
                </p>
                {activeSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={currentSession?.id === session.id}
                    onSelect={selectSession}
                    onDelete={deleteSession}
                  />
                ))}
              </div>
            )}

            {/* Completed Sessions */}
            {completedSessions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-brand-text/60 dark:text-gray-400 mb-2 mt-3 flex items-center gap-1">
                  <FaCheckCircle size={12} />
                  Đã hoàn thành ({completedSessions.length})
                </p>
                {completedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={currentSession?.id === session.id}
                    onSelect={selectSession}
                    onDelete={deleteSession}
                  />
                ))}
              </div>
            )}

            {sessions.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-brand-text/60 dark:text-gray-400 text-sm py-8"
              >
                <FaCommentDots size={32} className="mx-auto mb-2 text-brand-light/60 dark:text-gray-700" />
                Chưa có phiên phỏng vấn nào
                <br />
                <span className="text-xs">Nhấn "Phiên mới" để bắt đầu</span>
              </motion.div>
            )}

            {isLoading && (
              <div className="flex justify-center py-8">
                <FaSpinner className="animate-spin text-brand-primary" size={24} />
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <motion.div
          variants={fadeInUp}
          className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-custom flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-brand-light dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                transition={{ duration: 0.2 }}
                className="p-2 rounded-xl bg-brand-light/30 dark:bg-gray-700/30"
              >
                <FaRobot size={20} className="text-brand-primary" />
              </motion.div>
              <div>
                <h2 className="font-bold text-brand-secondary dark:text-white">
                  {currentSession?.title || 'Phỏng vấn thử với AI'}
                </h2>
                <div className="flex items-center gap-2 text-xs text-brand-text/60 dark:text-gray-400 flex-wrap">
                  <span>{messages.length} tin nhắn</span>
                  {currentSession?.status === 'completed' && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] flex items-center gap-1">
                      <FaCheckCircle size={10} />
                      Đã hoàn thành
                    </span>
                  )}
                  {currentSession?.status === 'in_progress' && (
                    <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full text-[10px] flex items-center gap-1">
                      <FaClock size={10} />
                      Đang diễn ra
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* End Interview Button - chỉ hiện khi đang diễn ra */}
              {currentSession?.status === 'in_progress' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={endInterview}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm font-medium text-red-500 border border-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? <FaSpinner className="animate-spin" size={14} /> : 'Kết thúc'}
                </motion.button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/30 dark:bg-gray-900/30">
            {messages.length === 0 && currentSession && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center text-brand-text/60 dark:text-gray-400"
              >
                <FaCommentDots size={48} className="mb-3 text-brand-light/60 dark:text-gray-700" />
                <p>Chưa có tin nhắn nào</p>
                <p className="text-sm">Hãy bắt đầu cuộc trò chuyện với AI</p>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id || index}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-gradient-brand'
                          : 'bg-brand-light dark:bg-gray-700'
                      }`}
                    >
                      {msg.sender === 'user'
                        ? <FaUser size={14} className="text-white" />
                        : <FaRobot size={14} className="text-brand-primary" />
                      }
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      className={`px-4 py-3 rounded-2xl ${
                        msg.sender === 'user'
                          ? 'bg-gradient-brand text-white'
                          : 'bg-brand-light/50 dark:bg-gray-700/50 text-brand-secondary dark:text-white'
                      } transition-all duration-200`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${
                        msg.sender === 'user' ? 'text-white/60' : 'text-brand-text/40 dark:text-gray-500'
                      }`}>
                        {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('vi-VN') : ''}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isSending && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-brand-light dark:bg-gray-700 flex items-center justify-center">
                    <FaRobot size={14} className="text-brand-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl bg-brand-light/50 dark:bg-gray-700/50">
                    <div className="flex gap-1">
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-brand-primary rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 bg-brand-primary rounded-full"
                      />
                      <motion.span
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 bg-brand-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-brand-light dark:border-gray-700 flex-shrink-0 bg-white dark:bg-gray-800">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !currentSession
                    ? 'Chọn hoặc tạo phiên phỏng vấn'
                    : currentSession.status === 'completed'
                      ? 'Phiên đã kết thúc. Tạo phiên mới để tiếp tục.'
                      : 'Nhập tin nhắn của bạn...'
                }
                rows={1}
                disabled={!currentSession || currentSession?.status === 'completed' || isSending}
                className="flex-1 px-4 py-3 bg-brand-bg dark:bg-gray-900 border border-brand-light dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!input.trim() || !currentSession || currentSession?.status === 'completed' || isSending}
                className="px-4 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                {isSending ? (
                  <FaSpinner className="animate-spin" size={18} />
                ) : (
                  <FaPaperPlane size={18} />
                )}
              </motion.button>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-brand-text/40 dark:text-gray-500 mt-2 text-center"
            >
              {!currentSession
                ? 'Chọn hoặc tạo phiên phỏng vấn để bắt đầu'
                : currentSession.status === 'completed'
                  ? 'Phiên phỏng vấn đã kết thúc. Tạo phiên mới để tiếp tục.'
                  : 'Nhấn Enter để gửi, Shift+Enter để xuống dòng'
              }
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

// Component Session Item
const SessionItem = ({ session, isActive, onSelect, onDelete }) => {
  const isCompleted = session.status === 'completed'

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
        isActive
          ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-2 border-brand-primary'
          : 'hover:bg-brand-light dark:hover:bg-gray-700/50'
      }`}
      onClick={() => onSelect(session)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
            {session.title || `Phiên ${new Date(session.created_at).toLocaleDateString('vi-VN')}`}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-xs text-brand-text/60 dark:text-gray-400">
              {new Date(session.created_at).toLocaleString('vi-VN')}
            </p>
            {isCompleted ? (
              <span className="text-[10px] px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1">
                <FaCheckCircle size={10} />
                Đã hoàn thành
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center gap-1">
                <FaClock size={10} />
                Đang diễn ra
              </span>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => onDelete(session.id, e)}
          className="p-1.5 rounded-lg text-brand-text/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
        >
          <FaTrash size={12} />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default MockInterviewChat