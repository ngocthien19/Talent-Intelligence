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