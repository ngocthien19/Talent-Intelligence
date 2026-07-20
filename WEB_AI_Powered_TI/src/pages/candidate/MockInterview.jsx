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
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'
import { toast } from 'react-toastify'

const MockInterviewChat = () => {
  const { t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Tự động scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load danh sách phiên
  const loadSessions = async () => {
    try {
      const response = await mockInterviewApi.getSessions()
      if (response.success) {
        setSessions(response.data || [])
      }
    } catch (error) {
      console.error('Load sessions error:', error)
    }
  }

  // Tạo phiên mới
  const createNewSession = async () => {
    setIsLoading(true)
    try {
      const response = await mockInterviewApi.createSession()
      if (response.success) {
        setCurrentSession(response.data.session)
        setMessages([{
          id: 'welcome',
          sender: 'ai',
          message: response.data.welcomeMessage,
          created_at: new Date()
        }])
        setShowHistory(false)
        await loadSessions()
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể tạo phiên phỏng vấn')
    } finally {
      setIsLoading(false)
    }
  }

  // Load lịch sử chat của phiên
  const loadChatHistory = async (sessionId) => {
    setIsLoading(true)
    try {
      const response = await mockInterviewApi.getChatHistory(sessionId)
      if (response.success) {
        setMessages(response.data || [])
      }
    } catch (error) {
      toast.error('Không thể tải lịch sử chat')
    } finally {
      setIsLoading(false)
    }
  }

  // Chọn phiên cũ
  const selectSession = async (session) => {
    setCurrentSession(session)
    setShowHistory(false)
    await loadChatHistory(session.id)
  }

  // Gửi tin nhắn
  const sendMessage = async () => {
    const message = input.trim()
    if (!message || !currentSession) return

    setInput('')

    // Thêm tin nhắn user vào UI ngay
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      message: message,
      created_at: new Date()
    }])

    setIsLoading(true)
    try {
      const response = await mockInterviewApi.sendMessage({
        sessionId: currentSession.id,
        message: message
      })

      if (response.success) {
        setMessages(prev => [...prev, response.data.message])
        // Cập nhật session info
        setCurrentSession(response.data.session)
      }
    } catch (error) {
      toast.error(error?.message || 'Không thể gửi tin nhắn')
      // Remove user message if failed
      setMessages(prev => prev.filter(m => m.id !== 'pending'))
    } finally {
      setIsLoading(false)
    }
  }

  // Xóa phiên
  const deleteSession = async (sessionId) => {
    if (!confirm('Bạn có chắc muốn xóa phiên phỏng vấn này?')) return

    try {
      await mockInterviewApi.deleteSession(sessionId)
      await loadSessions()
      if (currentSession?.id === sessionId) {
        setCurrentSession(null)
        setMessages([])
      }
      toast.success('Đã xóa phiên phỏng vấn')
    } catch (error) {
      toast.error('Không thể xóa phiên phỏng vấn')
    }
  }

  // Khởi tạo
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions()
      // Tạo phiên mới nếu chưa có
      if (!currentSession) {
        createNewSession()
      }
    }
  }, [isAuthenticated])

  // Xử lý phím Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isAuthenticated) {
    return <div className="app-container py-6">Vui lòng đăng nhập</div>
  }

  return (
    <div className="app-container py-6 h-[calc(100vh-120px)]">
      <div className="max-w-6xl mx-auto h-full flex gap-4">
        {/* Sidebar - Danh sách phiên */}
        <div className={`${showHistory ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-custom p-4 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-secondary dark:text-white flex items-center gap-2">
                <FaHistory size={16} />
                Lịch sử
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-brand-light dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <FaChevronLeft size={16} />
              </button>
            </div>

            <button
              onClick={createNewSession}
              className="w-full px-4 py-2 bg-gradient-brand text-white rounded-lg font-medium hover:shadow-glow transition-all duration-200 flex items-center justify-center gap-2 mb-4"
            >
              <FaPlus size={14} />
              Phiên mới
            </button>

            <div className="flex-1 overflow-y-auto space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    currentSession?.id === session.id
                      ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-2 border-brand-primary'
                      : 'hover:bg-brand-light dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-secondary dark:text-white truncate">
                        {session.title || `Phiên ${new Date(session.created_at).toLocaleDateString('vi-VN')}`}
                      </p>
                      <p className="text-xs text-brand-text/60 dark:text-gray-400">
                        {new Date(session.created_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteSession(session.id)
                      }}
                      className="p-1 text-brand-text/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-center text-brand-text/60 dark:text-gray-400 text-sm py-8">
                  Chưa có phiên phỏng vấn nào
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-custom flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-brand-light dark:border-gray-700 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-light/30 dark:bg-gray-700/30">
                <FaRobot size={20} className="text-brand-primary" />
              </div>
              <div>
                <h2 className="font-bold text-brand-secondary dark:text-white">
                  {currentSession?.title || 'Phỏng vấn thử với AI'}
                </h2>
                <p className="text-xs text-brand-text/60 dark:text-gray-400">
                  {currentSession?.message_count || 0} tin nhắn
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 rounded-lg hover:bg-brand-light dark:hover:bg-gray-700 transition-colors lg:hidden"
            >
              <FaHistory size={18} className="text-brand-text/60" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/30 dark:bg-gray-900/30">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-brand'
                      : 'bg-brand-light dark:bg-gray-700'
                  }`}>
                    {msg.sender === 'user'
                      ? <FaUser size={14} className="text-white" />
                      : <FaRobot size={14} className="text-brand-primary" />
                    }
                  </div>
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-brand text-white'
                      : 'bg-brand-light/50 dark:bg-gray-700/50 text-brand-secondary dark:text-white'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 ${
                      msg.sender === 'user' ? 'text-white/60' : 'text-brand-text/40 dark:text-gray-500'
                    }`}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('vi-VN') : ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
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
                    <FaSpinner className="animate-spin text-brand-primary" size={20} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-brand-light dark:border-gray-700 flex-shrink-0">
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn của bạn..."
                rows={1}
                className="flex-1 px-4 py-3 bg-brand-bg dark:bg-gray-900 border border-brand-light dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none transition-all duration-200 text-brand-secondary dark:text-white placeholder:text-brand-text/40"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-3 bg-gradient-brand text-white rounded-xl font-medium hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaPaperPlane size={18} />
              </button>
            </div>
            <p className="text-xs text-brand-text/40 dark:text-gray-500 mt-2 text-center">
              Nhấn Enter để gửi, Shift+Enter để xuống dòng
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MockInterviewChat