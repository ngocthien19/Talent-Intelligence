export const formatNumber = (num) => {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

export const formatSalary = (salaryRange) => {
  if (!salaryRange) return 'Thương lượng'
  const { min, max, currency } = salaryRange
  if (min && max) {
    return `${formatNumber(min)} - ${formatNumber(max)} ${currency || 'VND'}`
  }
  if (min) return `Từ ${formatNumber(min)} ${currency || 'VND'}`
  if (max) return `Đến ${formatNumber(max)} ${currency || 'VND'}`
  return 'Thương lượng'
}

export const getDaysAgo = (date) => {
  const now = new Date()
  const created = new Date(date)
  const diffTime = Math.abs(now - created)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return '1 ngày trước'
  return `${diffDays} ngày trước`
}

export const getAvatarUrl = (avatar) => {
  if (!avatar) return null

  // Nếu avatar là object có secure_url (avatar từ hệ thống - Cloudinary)
  if (typeof avatar === 'object' && avatar.secure_url) {
    return avatar.secure_url
  }

  // Nếu avatar là object có url (avatar từ hệ thống - dạng khác)
  if (typeof avatar === 'object' && avatar.url) {
    return avatar.url
  }

  // Nếu avatar là string URL (avatar từ Google)
  if (typeof avatar === 'string') {
    return avatar
  }

  return null
}

export const getInitials = (name) => {
  if (!name) return 'U'
  return name.charAt(0).toUpperCase()
}

export const formatCompactNumber = (num) => {
  if (!num && num !== 0) return '0'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
  return num.toString()
}

export const formatDate = (date) => {
  if (!date) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export const dateToInputString = (date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const inputStringToDate = (str) => {
  if (!str) return null
  const parts = str.split('-')
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
}