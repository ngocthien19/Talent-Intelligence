import { GoogleGenerativeAI } from '@google/generative-ai'
import { env } from '~/config/environment'

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY)
const MODEL_NAME = 'gemini-2.5-flash'

// Hàm retry với exponential backoff
const retry = async (fn, maxRetries = 5, delay = 1000) => {
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (error.status !== 429 && error.status !== 503) {
        throw error
      }
      const waitTime = delay * Math.pow(2, attempt - 1) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  throw lastError
}

export const getModel = () => {
  return genAI.getGenerativeModel({ model: MODEL_NAME })
}

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

// Generate content với retry
export const generateContent = async (prompt) => {
  return retry(async () => {
    const model = getModel()
    const result = await model.generateContent(prompt)
    return result.response.text()
  })
}

// Generate structured JSON content với retry
export const generateStructuredContent = async (prompt) => {
  return retry(async () => {
    const model = getStructuredModel()
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return JSON.parse(text)
    } catch {
      return text
    }
  })
}

// Generate creative content với retry
export const generateCreativeContent = async (prompt) => {
  return retry(async () => {
    const model = getCreativeModel()
    const result = await model.generateContent(prompt)
    return result.response.text()
  })
}

// TẠO EMBEDDING
export const generateEmbedding = async (text) => {
  return retry(async () => {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2' })
      const result = await model.embedContent(text)
      return result.embedding.values
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error.message}`)
    }
  })
}

export default {
  getModel,
  getStructuredModel,
  getCreativeModel,
  generateContent,
  generateStructuredContent,
  generateCreativeContent,
  generateEmbedding
}