import mockInterviewModel from '~/models/candidate/mock-interview/mock-interview.model'
import { generateStructuredContent } from '~/providers/gemini.provider'
import { v4 as uuidv4 } from 'uuid'

const mockInterviewService = {
  createSession: async (userId, language = 'vi') => {
    const candidate = await mockInterviewModel.getCandidateByUserId(userId)
    if (!candidate) {
      throw new Error('Không tìm thấy hồ sơ ứng viên')
    }

    const sessionToken = uuidv4()
    const session = await mockInterviewModel.createChatSession({
      candidateId: candidate.id,
      sessionToken
    })

    const welcomeMessage = getWelcomeMessage(language)

    await mockInterviewModel.saveChatMessage({
      sessionId: session.id,
      sender: 'ai',
      message: welcomeMessage,
      metadata: { type: 'system', isWelcome: true, language }
    })

    return {
      session,
      welcomeMessage
    }
  },

  sendMessage: async (sessionId, userId, message, language = 'vi') => {
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền truy cập phiên này')
    }

    const session = await mockInterviewModel.getChatSession(sessionId)
    if (!session) {
      throw new Error('Không tìm thấy phiên phỏng vấn')
    }

    await mockInterviewModel.saveChatMessage({
      sessionId,
      sender: 'user',
      message: message
    })

    const history = await mockInterviewModel.getChatHistory(sessionId)
    const aiResponse = await generateAIResponse(history, session, language)

    const savedAIResponse = await mockInterviewModel.saveChatMessage({
      sessionId,
      sender: 'ai',
      message: aiResponse.message,
      metadata: { ...aiResponse.metadata, language }
    })

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

  endSession: async (sessionId, userId, language = 'vi') => {
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền thực hiện hành động này')
    }

    const session = await mockInterviewModel.getChatSession(sessionId)
    if (!session) {
      throw new Error('Không tìm thấy phiên phỏng vấn')
    }

    const history = await mockInterviewModel.getChatHistory(sessionId)
    const userMessages = history.filter(h => h.sender === 'user')

    const summaryMessage = await generateSummaryMessage(history, session, language)

    await mockInterviewModel.saveChatMessage({
      sessionId,
      sender: 'ai',
      message: summaryMessage,
      metadata: { type: 'summary', isEnd: true, language }
    })

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

function getWelcomeMessage(language) {
  const messages = {
    vi: `Chào bạn! Tôi là trợ lý phỏng vấn AI.

Tôi sẽ giúp bạn luyện tập phỏng vấn như một buổi phỏng vấn thực tế. Bạn có thể:

- Trò chuyện tự nhiên: Trả lời các câu hỏi của tôi như trong phỏng vấn thật
- Hỏi đáp: Hỏi tôi bất kỳ câu hỏi nào về phỏng vấn
- Nhận phản hồi: Tôi sẽ đánh giá và góp ý cho câu trả lời của bạn

Hãy bắt đầu bằng cách giới thiệu về bản thân bạn nhé!`,

    en: `Hello! I am your AI interview assistant.

I will help you practice interviews like a real interview session. You can:

- Natural conversation: Answer my questions like in a real interview
- Q&A: Ask me any questions about interviews
- Get feedback: I will evaluate and give feedback on your answers

Let's start by introducing yourself!`,

    ja: `こんにちは！私はAI面接アシスタントです。

実際の面接のように面接練習をお手伝いします。以下のことができます：

- 自然な会話：実際の面接のように私の質問に答える
- Q&A：面接に関する質問は何でも聞いてください
- フィードバック：回答を評価し、改善点をフィードバックします

まずは自己紹介から始めましょう！`
  }

  return messages[language] || messages.vi
}

async function generateAIResponse(history, session, language = 'vi') {
  const messages = history.map(h => ({
    role: h.sender === 'user' ? 'user' : 'assistant',
    content: h.message
  }))

  const userMessageCount = history.filter(h => h.sender === 'user').length

  const systemPrompt = getSystemPrompt(language)
  const endingInstruction = userMessageCount >= 10 ? getEndingInstruction(language) : ''
  const jsonInstruction = getJsonInstruction(language)

  const prompt = `${systemPrompt}
${endingInstruction}

=== CHAT HISTORY ===
${messages.map(m => `${m.role === 'user' ? getLabel('user', language) : getLabel('ai', language)}: ${m.content}`).join('\n')}

=== REQUIREMENT ===
${jsonInstruction}`

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

  if (response.message) {
    response.message = response.message
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .trim()
  }

  return response
}

async function generateSummaryMessage(history, session, language = 'vi') {
  const userMessages = history.filter(h => h.sender === 'user')

  if (userMessages.length === 0) {
    return getNoAnswerMessage(language)
  }

  const prompt = getSummaryPrompt(language, history, userMessages.length)

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
        message: getDefaultSummaryMessage(language, userMessages.length),
        metadata: { type: 'summary' }
      }
    }
  }

  if (response.message) {
    response.message = response.message
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
      .replace(/[\u{2600}-\u{27BF}]/gu, '')
      .trim()
  }

  return response.message || response
}

function getSystemPrompt(language) {
  const prompts = {
    vi: `Bạn là một trợ lý phỏng vấn AI chuyên nghiệp.

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
3. Nếu ứng viên đã trả lời tốt -> Khen ngợi và hỏi sâu hơn`,

    en: `You are a professional AI interview assistant.

### ROLE
- You are a recruiter or HR specialist conducting an interview with a candidate
- Goal: Evaluate the candidate professionally and friendly

### STYLE
- Professional, friendly, encouraging
- Provide constructive feedback after each answer
- Ask follow-up questions based on the candidate's answers
- DO NOT use emoji in messages
- Use English with professional tone

### RULES
1. If candidate hasn't introduced themselves -> Ask about background, work experience, education
2. After each answer -> Give brief feedback (1-2 sentences) and ask next question
3. Diverse questions: technical, behavioral, situational, company culture
4. Do not repeat questions already asked
5. If answer is too short -> Encourage candidate to elaborate

### FEEDBACK FORMAT
Your response should have structure:
1. Brief evaluation of the answer (strengths, areas for improvement)
2. Next question (if any)
3. If candidate answered well -> Praise and ask deeper questions`,

    ja: `あなたはプロフェッショナルなAI面接アシスタントです。

### 役割
- あなたは採用担当者またはHRスペシャリストとして候補者と面接を行います
- 目標: 候補者を専門的かつ親しみやすく評価する

### スタイル
- 専門的、親しみやすく、候補者を励ます
- 各回答の後に建設的なフィードバックを提供する
- 候補者の回答に基づいてフォローアップの質問をする
- メッセージに絵文字を使用しない
- 日本語を使用し、丁寧な文体を保つ

### ルール
1. 候補者が自己紹介をしていない場合 -> 経歴、職務経験、学歴について質問する
2. 各回答の後 -> 簡潔なフィードバック（1-2文）と次の質問をする
3. 多様な質問: 技術的、行動的、状況的、企業文化
4. 既に質問した質問を繰り返さない
5. 回答が短すぎる場合 -> より詳しく話すよう促す

### フィードバック形式
回答は以下の構造を持つべき:
1. 回答の簡潔な評価（強み、改善点）
2. 次の質問（もしあれば）
3. 候補者がよく回答した場合 -> 褒めてより深い質問をする`
  }

  return prompts[language] || prompts.vi
}

function getEndingInstruction(language) {
  const instructions = {
    vi: `
### KẾT THÚC PHỎNG VẤN
Sau khoảng 10 câu trả lời, bạn nên tổng kết:
- Điểm mạnh của ứng viên
- Lĩnh vực cần cải thiện
- Lời khuyên để phát triển
- Hỏi ứng viên có câu hỏi gì không`,

    en: `
### ENDING INTERVIEW
After about 10 answers, you should summarize:
- Candidate's strengths
- Areas for improvement
- Advice for development
- Ask if candidate has any questions`,

    ja: `
### 面接の終了
約10回の回答後、以下のようにまとめるべき:
- 候補者の強み
- 改善点
- 成長のためのアドバイス
- 候補者に質問があるか尋ねる`
  }

  return instructions[language] || instructions.vi
}

function getJsonInstruction(language) {
  const instructions = {
    vi: `Hãy phản hồi tin nhắn vừa rồi của ứng viên.
Trả về JSON:
{
  "message": "Phản hồi của bạn (không có emoji, có dấu tiếng Việt)",
  "metadata": {
    "type": "question" hoặc "feedback" hoặc "summary",
    "category": "technical" hoặc "behavioral" hoặc "situational" hoặc "general",
    "score": null hoặc số điểm từ 1-10
  }
}`,

    en: `Respond to the candidate's latest message.
Return JSON:
{
  "message": "Your response (no emoji, in English)",
  "metadata": {
    "type": "question" or "feedback" or "summary",
    "category": "technical" or "behavioral" or "situational" or "general",
    "score": null or score from 1-10
  }
}`,

    ja: `候補者の最新のメッセージに応答してください。
JSONを返してください：
{
  "message": "あなたの応答（絵文字なし、日本語）",
  "metadata": {
    "type": "question" または "feedback" または "summary",
    "category": "technical" または "behavioral" または "situational" または "general",
    "score": null または 1-10のスコア
  }
}`
  }

  return instructions[language] || instructions.vi
}

function getLabel(type, language) {
  const labels = {
    vi: { user: 'Ứng viên', ai: 'AI' },
    en: { user: 'Candidate', ai: 'AI' },
    ja: { user: '候補者', ai: 'AI' }
  }
  return labels[language]?.[type] || labels.vi[type]
}

function getNoAnswerMessage(language) {
  const messages = {
    vi: 'Bạn chưa trả lời câu hỏi nào. Hãy thử lại lần sau nhé!',
    en: 'You haven\'t answered any questions yet. Please try again!',
    ja: 'まだ質問に回答していません。もう一度お試しください！'
  }
  return messages[language] || messages.vi
}

function getDefaultSummaryMessage(language, count) {
  const messages = {
    vi: `Cảm ơn bạn đã tham gia phỏng vấn! Bạn đã trả lời ${count} câu hỏi. Hãy tiếp tục luyện tập để cải thiện kỹ năng nhé!`,
    en: `Thank you for participating in the interview! You answered ${count} questions. Keep practicing to improve your skills!`,
    ja: `面接に参加していただきありがとうございます！${count}件の質問に回答しました。スキル向上のために練習を続けてください！`
  }
  return messages[language] || messages.vi
}

function getSummaryPrompt(language, history, count) {
  const prompts = {
    vi: `
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
}`,

    en: `
You are an AI interview assistant. Please summarize the candidate's interview session.

=== CHAT HISTORY ===
${history.map(h => `${h.sender === 'user' ? 'Candidate' : 'AI'}: ${h.message}`).join('\n')}

=== REQUIREMENT ===
Please summarize the interview session with:
1. Candidate's strengths (based on answers)
2. Areas for improvement
3. Advice for the candidate

Return JSON:
{
  "message": "Summary content (no emoji, in English)",
  "metadata": {
    "type": "summary",
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "suggestions": ["suggestion 1", "suggestion 2"]
  }
}`,

    ja: `
あなたはAI面接アシスタントです。候補者の面接セッションを要約してください。

=== チャット履歴 ===
${history.map(h => `${h.sender === 'user' ? '候補者' : 'AI'}: ${h.message}`).join('\n')}

=== 要件 ===
以下の内容で面接セッションを要約してください：
1. 候補者の強み（回答に基づく）
2. 改善点
3. 候補者へのアドバイス

JSONを返してください：
{
  "message": "要約内容（絵文字なし、日本語）",
  "metadata": {
    "type": "summary",
    "strengths": ["強み1", "強み2"],
    "weaknesses": ["改善点1", "改善点2"],
    "suggestions": ["アドバイス1", "アドバイス2"]
  }
}`
  }

  return prompts[language] || prompts.vi
}

export default mockInterviewService