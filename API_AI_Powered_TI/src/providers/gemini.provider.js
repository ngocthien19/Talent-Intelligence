import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '~/config/environment'

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)

const MODEL_NAME = 'gemini-3.5-flash'

export const getModel = () => {
  return genAI.getGenerativeModel({ model: MODEL_NAME })
}

// Lấy model với cấu hình structured (cho JSON output)
export const getStructuredModel = () => {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.1,
      topK: 1,
      topP: 0.8,
      maxOutputTokens: 4096
    }
  })
}

// Lấy model với cấu hình creative (cho chat, interview)
export const getCreativeModel = () => {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      temperature: 0.8,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048
    }
  })
}

// Generate content với model mặc định
export const generateContent = async (prompt) => {
  try {
    const model = getModel()
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`AI generation failed: ${error.message}`)
  }
}

// Generate structured JSON content
export const generateStructuredContent = async (prompt) => {
  try {
    const model = getStructuredModel()
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Try to parse JSON
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(text)
    } catch {
      return text
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`AI generation failed: ${error.message}`)
  }
}

// Generate creative content (chat, interview)
export const generateCreativeContent = async (prompt) => {
  try {
    const model = getCreativeModel()
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`AI generation failed: ${error.message}`)
  }
}

export default {
  getModel,
  getStructuredModel,
  getCreativeModel,
  generateContent,
  generateStructuredContent,
  generateCreativeContent
}