import mockInterviewModel from '~/models/candidate/mock-interview/mock-interview.model'
import { generateStructuredContent } from '~/providers/gemini.provider'
import { v4 as uuidv4 } from 'uuid'

const mockInterviewService = {
  createSession: async (userId) => {
    const candidate = await mockInterviewModel.getCandidateByUserId(userId)
    if (!candidate) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    const sessionToken = uuidv4()
    const session = await mockInterviewModel.createChatSession({
      candidateId: candidate.id,
      sessionToken
    })

    const welcomeMessage = `Chào bạn! Tôi là trợ lý phỏng vấn AI.

Tôi sẽ giúp bạn luyện tập phỏng vấn như một buổi phỏng vấn thực tế. Bạn có thể:

- Trò chuyện tự nhiên: Trả lời các câu hỏi của tôi như trong phỏng vấn thật
- Hỏi đáp: Hỏi tôi bất kỳ câu hỏi nào về phỏng vấn
- Nhận phản hồi: Tôi sẽ đánh giá và góp ý cho câu trả lời của bạn

Hãy bắt đầu bằng cách giới thiệu về bản thân bạn nhé!`

    await mockInterviewModel.saveChatMessage({
      sessionId: session.id,
      sender: 'ai',
      message: welcomeMessage,
      metadata: { type: 'system', isWelcome: true }
    })

    return {
      session,
      welcomeMessage
    }
  },

  sendMessage: async (sessionId, userId, message) => {
    // 1. Kiểm tra quyền
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền truy cập phiên này')
    }

    // 2. Lấy session
    const session = await mockInterviewModel.getChatSession(sessionId)
    if (!session) {
      throw new Error('Không tìm thấy phiên phỏng vấn')
    }

    // 3. Lưu tin nhắn của user
    await mockInterviewModel.saveChatMessage({
      sessionId,
      sender: 'user',
      message: message
    })

    // 4. Lấy lịch sử chat để có ngữ cảnh
    const history = await mockInterviewModel.getChatHistory(sessionId)

    // 5. Tạo phản hồi từ AI (dựa trên ngữ cảnh)
    const aiResponse = await generateAIResponse(history, session)

    // 6. Lưu tin nhắn của AI
    const savedAIResponse = await mockInterviewModel.saveChatMessage({
      sessionId,
      sender: 'ai',
      message: aiResponse.message,
      metadata: aiResponse.metadata
    })

    // 7. Cập nhật số lượng tin nhắn
    await mockInterviewModel.updateChatSession(sessionId, {
      messageCount: (session.message_count || 0) + 2
    })

    return {
      message: savedAIResponse,
      session: await mockInterviewModel.getChatSession(sessionId)
    }
  },

  getChatHistory: async (sessionId, userId) => {
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền truy cập phiên này')
    }
    return await mockInterviewModel.getChatHistory(sessionId)
  },

  getSessions: async (userId) => {
    return await mockInterviewModel.getChatSessionsByUserId(userId)
  },

  getSessionDetail: async (sessionId, userId) => {
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền xem phiên này')
    }
    return await mockInterviewModel.getChatSessionDetail(sessionId)
  },

  endSession: async (sessionId, userId) => {
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền thực hiện hành động này')
    }

    const session = await mockInterviewModel.getChatSession(sessionId)
    if (!session) {
      throw new Error('Không tìm thấy phiên phỏng vấn')
    }

    // Lấy lịch sử chat để tạo tổng kết
    const history = await mockInterviewModel.getChatHistory(sessionId)

    // Đếm số câu hỏi và câu trả lời
    const userMessages = history.filter(h => h.sender === 'user')
    const aiMessages = history.filter(h => h.sender === 'ai' && h.metadata?.type !== 'system')

    // Tạo tin nhắn tổng kết từ AI
    const summaryMessage = await generateSummaryMessage(history, session)

    // Lưu tin nhắn tổng kết
    await mockInterviewModel.saveChatMessage({
      sessionId,
      sender: 'ai',
      message: summaryMessage,
      metadata: { type: 'summary', isEnd: true }
    })

    // Cập nhật status thành 'completed'
    const updatedSession = await mockInterviewModel.updateChatSession(sessionId, {
      status: 'completed',
      messageCount: (session.message_count || 0) + 1
    })

    return {
      session: updatedSession,
      summary: {
        totalQuestions: userMessages.length,
        totalMessages: history.length,
        message: summaryMessage
      }
    }
  },

  deleteSession: async (sessionId, userId) => {
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền xóa phiên này')
    }
    return await mockInterviewModel.deleteChatSession(sessionId)
  }
}

async function generateAIResponse(history, session) {
  const messages = history.map(h => ({
    role: h.sender === 'user' ? 'user' : 'assistant',
    content: h.message
  }))

  const userMessageCount = history.filter(h => h.sender === 'user').length

  let systemPrompt = `Bạn là một trợ lý phỏng vấn AI chuyên nghiệp.

### VAI TRÒ
- Bạn là một nhà tuyển dụng hoặc chuyên gia HR đang phỏng vấn ứng viên
- Mục tiêu: Đánh giá ứng viên một cách chuyên nghiệp và thân thiện

### PHONG CÁCH
- Chuyên nghiệp, thân thiện, khuyến khích ứng viên
- Đưa ra phản hồi xây dựng sau mỗi câu trả lời
- Đặt câu hỏi tiếp nối dựa trên câu trả lời của ứng viên
- KHÔNG sử dụng emoji trong tin nhắn
- Sử dụng tiếng Việt có dấu, văn phong lịch sự

### QUY TẮC
1. Nếu ứng viên chưa giới thiệu bản thân -> Hỏi về bản thân, kinh nghiệm làm việc, học vấn
2. Sau mỗi câu trả lời -> Đưa phản hồi ngắn gọn (1-2 câu) và hỏi câu tiếp theo
3. Đa dạng câu hỏi: kỹ thuật, hành vi, tình huống, văn hóa công ty
4. Không lặp lại câu hỏi đã hỏi
5. Nếu câu trả lời quá ngắn -> Khuyến khích ứng viên nói thêm

### ĐỊNH DẠNG PHẢN HỒI
Phản hồi của bạn nên có cấu trúc:
1. Đánh giá ngắn về câu trả lời (điểm tốt, điểm cần cải thiện)
2. Câu hỏi tiếp theo (nếu còn)
3. Nếu ứng viên đã trả lời tốt -> Khen ngợi và hỏi sâu hơn`

  if (userMessageCount >= 10) {
    systemPrompt += `
### KẾT THÚC PHỎNG VẤN
Sau khoảng 10 câu trả lời, bạn nên tổng kết:
- Điểm mạnh của ứng viên
- Lĩnh vực cần cải thiện
- Lời khuyên để phát triển
- Hỏi ứng viên có câu hỏi gì không`
  }

  const prompt = `${systemPrompt}

=== LỊCH SỬ CHAT ===
${messages.map(m => `${m.role === 'user' ? 'Ứng viên' : 'AI'}: ${m.content}`).join('\n')}

=== YÊU CẦU ===
Hãy phản hồi tin nhắn vừa rồi của ứng viên.
Trả về JSON:
{
  "message": "Phản hồi của bạn (không có emoji, có dấu tiếng Việt)",
  "metadata": {
    "type": "question" hoặc "feedback" hoặc "summary",
    "category": "technical" hoặc "behavioral" hoặc "situational" hoặc "general",
    "score": null hoặc số điểm từ 1-10
  }
}`

  const result = await generateStructuredContent(prompt)

  let response = result
  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        response = JSON.parse(jsonMatch[0])
      } else {
        response = JSON.parse(result)
      }
    } catch {
      response = {
        message: result.substring(0, 500),
        metadata: { type: 'general', category: 'general' }
      }
    }
  }

  // Đảm bảo message không có emoji
  if (response.message) {
    response.message = response.message
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .trim()
  }

  return response
}

async function generateSummaryMessage(history, session) {
  const userMessages = history.filter(h => h.sender === 'user')
  const aiMessages = history.filter(h => h.sender === 'ai' && h.metadata?.type !== 'system')

  if (userMessages.length === 0) {
    return 'Bạn chưa trả lời câu hỏi nào. Hãy thử lại lần sau nhé!'
  }

  const prompt = `
Bạn là một trợ lý phỏng vấn AI. Hãy tổng kết buổi phỏng vấn của ứng viên.

=== LỊCH SỬ CHAT ===
${history.map(h => `${h.sender === 'user' ? 'Ứng viên' : 'AI'}: ${h.message}`).join('\n')}

=== YÊU CẦU ===
Hãy tổng kết buổi phỏng vấn với các nội dung:
1. Điểm mạnh của ứng viên (dựa trên câu trả lời)
2. Điểm cần cải thiện
3. Lời khuyên cho ứng viên

Trả về JSON:
{
  "message": "Nội dung tổng kết (không có emoji, có dấu tiếng Việt)",
  "metadata": {
    "type": "summary",
    "strengths": ["điểm mạnh 1", "điểm mạnh 2"],
    "weaknesses": ["điểm yếu 1", "điểm yếu 2"],
    "suggestions": ["gợi ý 1", "gợi ý 2"]
  }
}`

  const result = await generateStructuredContent(prompt)

  let response = result
  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        response = JSON.parse(jsonMatch[0])
      } else {
        response = JSON.parse(result)
      }
    } catch {
      response = {
        message: `Cảm ơn bạn đã tham gia phỏng vấn! Bạn đã trả lời ${userMessages.length} câu hỏi. Hãy tiếp tục luyện tập để cải thiện kỹ năng nhé!`,
        metadata: { type: 'summary' }
      }
    }
  }

  // Đảm bảo message không có emoji
  if (response.message) {
    response.message = response.message
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .trim()
  }

  return response.message || response
}

export default mockInterviewService