export const DEV_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const ROLES = {
  CANDIDATE: 'candidate',
  HR: 'hr'
}

export const isHR = (user) => user?.roleName === ROLES.HR
export const isCandidate = (user) => user?.roleName === ROLES.CANDIDATE

export const CANDIDATE_STATUS = {
  PENDING: 'pending',
  ANALYZING: 'analyzing',
  ANALYZED: 'analyzed',
  SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected'
}

export const INTERVIEW_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
}

export const NOTIFICATION_TYPES = {
  REPORT_SENT: 'report_sent',
  INTERVIEW_INVITE: 'interview_invite',
  ANALYSIS_COMPLETED: 'analysis_completed',
  STATUS_UPDATE: 'status_update',
  MOCK_INTERVIEW_INVITE: 'mock_interview_invite',
  NEW_JOB_OPPORTUNITY: 'new_job_opportunity',
  NEW_JOB_OPPORTUNITY_MATCHED: 'new_job_opportunity_matched'
}

export const LOCATIONS = [
  { value: '', label: 'Tất cả địa điểm' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'TP.Hồ Chí Minh', label: 'TP.Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Nha Trang', label: 'Nha Trang' },
  { value: 'Huế', label: 'Huế' },
  { value: 'Vũng Tàu', label: 'Vũng Tàu' },
  { value: 'Đà Lạt', label: 'Đà Lạt' },
  { value: 'Biên Hòa', label: 'Biên Hòa' },
  { value: 'Bình Dương', label: 'Bình Dương' }
]

export const EXPERIENCE_LEVELS = [
  { value: '', label: 'Tất cả kinh nghiệm' },
  { value: 'Mới tốt nghiệp', label: 'Mới tốt nghiệp' },
  { value: 'Junior (1-3 years)', label: 'Junior (1-3 years)' },
  { value: 'Mid-level (3-5 years)mid', label: 'Mid-level (3-5 years)' },
  { value: 'Senior (5-7 years)', label: 'Senior (5-7 years)' },
  { value: 'Lead (7-10 years)', label: 'Lead (7-10 years)' },
  { value: 'Manager (10+ years)manager', label: 'Manager (10+ years)' }
]

export const EMPLOYMENT_TYPES = [
  { value: '', label: 'Tất cả loại hình' },
  { value: 'Full-time', label: 'Full-time' },
  { value: 'Part-time', label: 'Part-time' },
  { value: 'Contract', label: 'Contract' },
  { value: 'Internship', label: 'Internship' },
  { value: 'Freelance', label: 'Freelance' }
]

export const SALARY_RANGES = [
  { value: '', label: 'Tất cả mức lương' },
  { value: '0-5000000', label: 'Dưới 5 triệu' },
  { value: '5000000-10000000', label: '5 - 10 triệu' },
  { value: '10000000-15000000', label: '10 - 15 triệu' },
  { value: '15000000-20000000', label: '15 - 20 triệu' },
  { value: '20000000-30000000', label: '20 - 30 triệu' },
  { value: '30000000-50000000', label: '30 - 50 triệu' },
  { value: '50000000-100000000', label: 'Trên 50 triệu' }
]

export const getExperienceLabel = (level) => {
  const labels = {
    'entry': 'Mới tốt nghiệp',
    'junior': 'Junior (1-3 năm)',
    'mid': 'Mid-level (3-5 năm)',
    'senior': 'Senior (5-7 năm)',
    'lead': 'Lead (7-10 năm)',
    'manager': 'Manager (10+ năm)'
  }
  return labels[level] || level
}

export const getEmploymentTypeLabel = (type) => {
  const labels = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    'contract': 'Hợp đồng',
    'internship': 'Thực tập',
    'freelance': 'Freelance'
  }
  return labels[type] || type
}