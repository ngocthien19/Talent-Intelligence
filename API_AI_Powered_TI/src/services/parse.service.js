import mammoth from 'mammoth'
import { extractText } from 'unpdf'

const parseService = {
  parsePDF: async (buffer) => {
    try {
      const uint8Array = new Uint8Array(buffer)
      const result = await extractText(uint8Array, { mergePages: true })
      return result.text || ''
    } catch (error) {
      throw new Error(`Lỗi parse PDF: ${error.message}`)
    }
  },

  parseWord: async (buffer) => {
    try {
      const result = await mammoth.extractRawText({ buffer })
      return result.value || ''
    } catch (error) {
      throw new Error(`Lỗi parse Word: ${error.message}`)
    }
  },

  parseFile: async (buffer, mimeType) => {
    let text = ''
    if (mimeType === 'application/pdf') {
      text = await parseService.parsePDF(buffer)
    } else if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await parseService.parseWord(buffer)
    } else if (mimeType === 'text/plain') {
      text = buffer.toString('utf-8')
    } else {
      throw new Error('Định dạng file không được hỗ trợ')
    }
    return text
  },

  // Trích xuất thông tin cơ bản cho ĐA DẠNG CV
  extractBasicInfo: (text) => {
    if (!text || text.trim() === '') {
      return { name: '', email: '', phone: '', skills: [] }
    }

    const info = { name: '', email: '', phone: '', skills: [] }

    // 1. Tìm email
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const emailMatch = text.match(emailRegex)
    if (emailMatch) info.email = emailMatch[0]

    // 2. Tìm số điện thoại
    const phoneRegex = /(?:\+?84|0)(?:\s*\.?\d{1,3}){3,4}/
    const phoneMatches = text.match(new RegExp(phoneRegex, 'g'))
    if (phoneMatches) {
      const validPhone = phoneMatches.find(p => {
        const clean = p.replace(/\D/g, '')
        return clean.length >= 10 && clean.length <= 12
      })
      if (validPhone) info.phone = validPhone.trim()
    }

    // 3. Tìm tên
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    const ignoreWords = ['resume', 'curriculum vitae', 'cv', 'profile', 'sơ yếu lý lịch', 'thông tin cá nhân']

    // Quét nếu file CÓ xuống dòng
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      let line = lines[i]
      if (ignoreWords.some(w => line.toLowerCase().includes(w))) continue
      if (line.includes(info.email) || (info.phone && line.includes(info.phone))) continue

      line = line.replace(/^(Họ và tên|Họ tên|Name|Full Name)\s*:\s*/i, '').trim()
      const stopSymbols = ['|', '-', '/', '–']
      for (const symbol of stopSymbols) {
        if (line.includes(symbol)) line = line.split(symbol)[0].trim()
      }

      const nameRegex = /^[a-zA-ZÀ-ỹ\s]{5,50}$/
      if (nameRegex.test(line) && line.split(/\s+/).length >= 2) {
        info.name = line
        break
      }
    }

    // Lấy chuỗi ở ngay đầu file, dừng lại ngay khi gặp chức danh, sđt, email hoặc ký tự |
    if (!info.name) {
      const fallbackNameRegex = /^([a-zA-ZÀ-Ỹà-ỹ\s]{5,40}?)(?:Backend|Frontend|Fullstack|Developer|Engineer|Phone|Email|\||\d)/i
      const match = text.match(fallbackNameRegex)
      if (match) {
        info.name = match[1].trim()
      }
    }

    // 4. Tìm Skills
    const skillHeaders = ['SKILLS', 'TECHNICAL SKILLS', 'KỸ NĂNG', 'KĨ NĂNG', 'EXPERTISE', 'CORE COMPETENCIES']
    const stopHeaders = ['LANGUAGE', 'EDUCATION', 'PROJECT', 'WORK', 'EXPERIENCE', 'HỌC VẤN', 'KINH NGHIỆM', 'DỰ ÁN', 'NGÔN NGỮ', 'CERTIFICATE', 'CHỨNG CHỈ', 'SUMMARY', 'ABOUT ME', 'GIỚI THIỆU']

    const headerPattern = skillHeaders.join('|')
    const stopPattern = stopHeaders.join('|')

    const skillRegex = new RegExp(`(?:${headerPattern})\\s*[:|]?\\s*([\\s\\S]*?)(?=(?:${stopPattern})\\s*[:|]?\\s*|$)`, 'i')
    const skillsSection = text.match(skillRegex)

    if (skillsSection) {
      let skillsContent = skillsSection[1]

      // Xóa ngoặc đơn
      skillsContent = skillsContent.replace(/\([^)]*\)/g, '')

      // Nhận diện Categories
      const categoryRegex = /\b(?:Backend|Frontend|Database|DevOps|Tools|Languages|Frameworks|Libraries|Cloud|OS|Kỹ năng|Nền tảng|Cơ sở dữ liệu|Hệ điều hành)(?:\s*(?:&|and|và)\s*[a-zA-Z]+)?\s*:/gi
      skillsContent = skillsContent.replace(categoryRegex, ',')

      // Cắt chuỗi theo các dấu đặc biệt
      skillsContent = skillsContent.replace(/[\n•\-*▪❖]/g, ',')

      // Split và làm sạch
      const allSkills = skillsContent
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 1)
        .filter(s => !/^[0-9]+$/.test(s))
        .filter(s => !/^(tốt|khá|giỏi|cơ bản|good|basic|excellent)$/i.test(s))

      info.skills = [...new Set(allSkills)]
    }

    return info
  }
}

export default parseService