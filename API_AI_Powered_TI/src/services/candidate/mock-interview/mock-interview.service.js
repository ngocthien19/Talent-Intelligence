import mockInterviewModel from '~/models/candidate/mock-interview/mock-interview.model'
import { generateStructuredContent } from '~/providers/gemini.provider'
import { v4 as uuidv4 } from 'uuid'

const mockInterviewService = {
  // BẮT ĐẦU PHỎNG VẤN
  startSession: async (userId, jobId = null, numberOfQuestions = 5) => {
    // 1. Lấy candidate theo userId
    const candidate = await mockInterviewModel.getCandidateByUserId(userId)
    if (!candidate) {
      throw new Error('Không tìm thấy hồ sơ ứng viên. Vui lòng tạo hồ sơ trước.')
    }

    // 2. Lấy thông tin job (nếu có)
    let job = null
    if (jobId) {
      job = await mockInterviewModel.getJob(jobId)
    }

    // 3. Tạo session token
    const sessionToken = uuidv4()

    // 4. Tạo câu hỏi từ AI
    const questions = await generateQuestions(candidate, job, numberOfQuestions)

    // 5. Lưu session
    const session = await mockInterviewModel.createSession({
      candidateId: candidate.id,
      sessionToken,
      totalQuestions: questions.length
    })

    // 6. Lưu câu hỏi
    const savedQuestions = await mockInterviewModel.saveQuestions(
      questions.map((q, index) => ({
        ...q,
        candidateId: candidate.id,
        order: index + 1
      }))
    )

    return {
      session,
      questions: savedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        order: q.order
      }))
    }
  },

  // TRẢ LỜI CÂU HỎI
  answerQuestion: async (sessionId, questionId, answer, userId) => {
    // 1. Kiểm tra session có thuộc về user không
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền thực hiện hành động này')
    }

    // 2. Lấy session
    const session = await mockInterviewModel.getSession(sessionId)
    if (!session) {
      throw new Error('Không tìm thấy phiên phỏng vấn')
    }

    // 3. Lấy câu hỏi
    const question = await mockInterviewModel.getQuestionById(questionId)
    if (!question) {
      throw new Error('Không tìm thấy câu hỏi')
    }

    // 4. Đánh giá câu trả lời bằng AI
    const evaluation = await evaluateAnswer(question.question, answer, question.suggestion)

    // 5. Lưu câu trả lời
    const answerRecord = await mockInterviewModel.saveAnswer({
      sessionId,
      questionId,
      answerText: answer,
      feedback: evaluation.feedback,
      score: evaluation.score,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      suggestion: evaluation.suggestion,
      responseTime: evaluation.responseTime || 30
    })

    // 6. Cập nhật session
    const updatedSession = await mockInterviewModel.updateSession(sessionId, {
      answeredQuestions: (session.answered_questions || 0) + 1,
      currentQuestionIndex: (session.current_question_index || 0) + 1
    })

    // 7. Kiểm tra nếu đã trả lời hết câu hỏi
    let isComplete = false
    if (updatedSession.answered_questions >= updatedSession.total_questions) {
      await mockInterviewService.endSession(sessionId)
      isComplete = true
    }

    return {
      answer: answerRecord,
      session: updatedSession,
      isComplete
    }
  },

  // KẾT THÚC PHỎNG VẤN
  endSession: async (sessionId) => {
    // 1. Lấy session
    const session = await mockInterviewModel.getSession(sessionId)
    if (!session) {
      throw new Error('Không tìm thấy phiên phỏng vấn')
    }

    // 2. Lấy tất cả câu trả lời của session
    const answers = await mockInterviewModel.getAnswersBySession(sessionId)

    // 3. Lấy tổng điểm
    const scoreSummary = await mockInterviewModel.getSessionScoreSummary(sessionId)

    // 4. Tổng hợp feedback
    const strengths = []
    const weaknesses = []
    const suggestions = []

    for (const answer of answers) {
      if (answer.strengths) {
        const strengthsList = Array.isArray(answer.strengths)
          ? answer.strengths
          : JSON.parse(answer.strengths)
        strengths.push(...strengthsList)
      }
      if (answer.weaknesses) {
        const weaknessesList = Array.isArray(answer.weaknesses)
          ? answer.weaknesses
          : JSON.parse(answer.weaknesses)
        weaknesses.push(...weaknessesList)
      }
      if (answer.suggestion) {
        suggestions.push(answer.suggestion)
      }
    }

    const avgScore = scoreSummary?.avg_score
      ? Math.round(parseFloat(scoreSummary.avg_score) * 10) / 10
      : 0

    const totalAnswers = parseInt(scoreSummary?.total_answers || 0)

    // 5. Cập nhật session
    const updatedSession = await mockInterviewModel.updateSession(sessionId, {
      status: 'completed',
      endedAt: new Date(),
      overallFeedback: `Điểm trung bình: ${avgScore}/10. Đã hoàn thành ${totalAnswers}/${session.total_questions} câu hỏi.`,
      strengths: [...new Set(strengths)],
      weaknesses: [...new Set(weaknesses)],
      suggestions: [...new Set(suggestions)]
    })

    return {
      session: updatedSession,
      summary: {
        totalQuestions: session.total_questions,
        answeredCount: totalAnswers,
        avgScore,
        strengths: [...new Set(strengths)],
        weaknesses: [...new Set(weaknesses)],
        suggestions: [...new Set(suggestions)]
      }
    }
  },

  // LẤY LỊCH SỬ
  getHistory: async (userId, limit = 10) => {
    return await mockInterviewModel.getSessionsByUserId(userId, limit)
  },

  // LẤY CHI TIẾT SESSION
  getSessionDetail: async (sessionId, userId) => {
    // Kiểm tra quyền
    const isOwner = await mockInterviewModel.isSessionOwner(sessionId, userId)
    if (!isOwner) {
      throw new Error('Bạn không có quyền xem phiên phỏng vấn này')
    }

    return await mockInterviewModel.getSessionDetail(sessionId)
  }
}

// HÀM TẠO CÂU HỎI TỪ AI
async function generateQuestions(candidate, job, numberOfQuestions) {
  const prompt = `
Bạn là một chuyên gia phỏng vấn AI. Hãy tạo ${numberOfQuestions} câu hỏi phỏng vấn cho ứng viên.

=== THÔNG TIN ỨNG VIÊN ===
Tên: ${candidate.name}
Vị trí ứng tuyển: ${candidate.position_applied || 'Không có'}
Kỹ năng: ${candidate.parsed_data?.skills?.join(', ') || 'Không có'}

=== THÔNG TIN CÔNG VIỆC ===
${job ? `
Tiêu đề: ${job.title}
Mô tả: ${job.description}
Yêu cầu: ${job.requirements || 'Không có'}
Kỹ năng yêu cầu: ${job.required_skills?.join(', ') || 'Không có'}
` : 'Không có thông tin công việc cụ thể'}

Vui lòng tạo ${numberOfQuestions} câu hỏi phỏng vấn với cấu trúc JSON sau:
[
  {
    "question": "Câu hỏi phỏng vấn",
    "category": "technical hoặc behavioral hoặc situational hoặc general",
    "difficulty": "easy hoặc medium hoặc hard",
    "reason": "Lý do hỏi câu hỏi này",
    "trap": "Điểm bẫy hoặc cần lưu ý trong câu hỏi",
    "suggestion": "Gợi ý cách trả lời tốt"
  }
]
`

  const result = await generateStructuredContent(prompt)

  // Nếu result là string, thử parse JSON
  let questions = result
  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(result)
      }
    } catch {
      questions = []
    }
  }

  return questions.slice(0, numberOfQuestions)
}

// HÀM ĐÁNH GIÁ CÂU TRẢ LỜI TỪ AI
async function evaluateAnswer(question, answer, suggestion) {
  const prompt = `
Bạn là một chuyên gia phỏng vấn AI. Hãy đánh giá câu trả lời của ứng viên.

=== CÂU HỎI ===
${question}

=== CÂU TRẢ LỜI CỦA ỨNG VIÊN ===
${answer}

=== GỢI Ý CÁCH TRẢ LỜI ===
${suggestion || 'Không có'}

Vui lòng đánh giá và trả về JSON:
{
  "feedback": "Đánh giá chi tiết về câu trả lời (2-3 câu)",
  "score": 0-10,
  "strengths": ["Điểm mạnh của câu trả lời"],
  "weaknesses": ["Điểm yếu của câu trả lời"],
  "suggestion": "Gợi ý cải thiện câu trả lời",
  "responseTime": 30
}
`

  const result = await generateStructuredContent(prompt)

  let evaluation = result
  if (typeof result === 'string') {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0])
      } else {
        evaluation = JSON.parse(result)
      }
    } catch {
      evaluation = {
        feedback: 'Không thể đánh giá câu trả lời',
        score: 5,
        strengths: [],
        weaknesses: [],
        suggestion: 'Hãy thử trả lời chi tiết hơn'
      }
    }
  }

  return evaluation
}

export default mockInterviewService