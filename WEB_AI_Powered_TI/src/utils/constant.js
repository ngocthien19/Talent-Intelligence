// src/utils/constant.js
import i18n from '~/i18n' // hoặc từ hook useLanguage

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
  { value: '', labelKey: 'job.allLocations' },
  { value: 'Hà Nội', labelKey: 'location.hanoi' },
  { value: 'TP.Hồ Chí Minh', labelKey: 'location.hoChiMinh' },
  { value: 'Đà Nẵng', labelKey: 'location.daNang' },
  { value: 'Hải Phòng', labelKey: 'location.haiphong' },
  { value: 'Cần Thơ', labelKey: 'location.cantho' },
  { value: 'Nha Trang', labelKey: 'location.nhatrang' },
  { value: 'Huế', labelKey: 'location.hue' },
  { value: 'Vũng Tàu', labelKey: 'location.vungtau' },
  { value: 'Đà Lạt', labelKey: 'location.dalat' },
  { value: 'Biên Hòa', labelKey: 'location.bienhoa' },
  { value: 'Bình Dương', labelKey: 'location.binhduong' }
]

export const getLocationLabel = (value, t) => {
  const option = LOCATIONS.find(opt => opt.value === value)
  if (!option) return value || t?.('job.allLocations') || 'Tất cả địa điểm'
  return t?.(option.labelKey) || option.labelKey
}

export const EXPERIENCE_LEVELS = [
  { value: '', labelKey: 'job.allExperience' },
  { value: 'Mới tốt nghiệp', labelKey: 'job.fresher' },
  { value: 'Junior (1-3 years)', labelKey: 'job.junior' },
  { value: 'Mid-Level (3-5 years)', labelKey: 'job.midLevel' },
  { value: 'Senior (5-7 years)', labelKey: 'job.senior' },
  { value: 'Lead (7-10 years)', labelKey: 'job.lead' },
  { value: 'Manager (10+ years)', labelKey: 'job.manager' }
]

export const getExperienceLabel = (value, t) => {
  const option = EXPERIENCE_LEVELS.find(opt => opt.value === value)
  if (!option) return value || t?.('job.allExperience') || 'Tất cả kinh nghiệm'
  return t?.(option.labelKey) || option.labelKey
}

export const EMPLOYMENT_TYPES = [
  { value: '', labelKey: 'job.allEmployment' },
  { value: 'Full-time', labelKey: 'job.fullTime' },
  { value: 'Part-time', labelKey: 'job.partTime' },
  { value: 'Contract', labelKey: 'job.contract' },
  { value: 'Internship', labelKey: 'job.internship' },
  { value: 'Freelance', labelKey: 'job.freelance' }
]

export const getEmploymentLabel = (value, t) => {
  const option = EMPLOYMENT_TYPES.find(opt => opt.value === value)
  if (!option) return value || t?.('job.allEmployment') || 'Tất cả loại hình'
  return t?.(option.labelKey) || option.labelKey
}

export const SALARY_RANGES = [
  { value: '', labelKey: 'salary.all' },
  { value: '0-5000000', labelKey: 'salary.below5M' },
  { value: '5000000-10000000', labelKey: 'salary.5to10M' },
  { value: '10000000-15000000', labelKey: 'salary.10to15M' },
  { value: '15000000-20000000', labelKey: 'salary.15to20M' },
  { value: '20000000-30000000', labelKey: 'salary.20to30M' },
  { value: '30000000-50000000', labelKey: 'salary.30to50M' },
  { value: '50000000-100000000', labelKey: 'salary.above50M' }
]

export const getSalaryLabel = (value, t) => {
  const option = SALARY_RANGES.find(opt => opt.value === value)
  if (!option) return value || t?.('salary.all') || 'Tất cả mức lương'
  return t?.(option.labelKey) || option.labelKey
}