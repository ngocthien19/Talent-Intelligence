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