export const DEV_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const ROLES = {
  CANDIDATE: 'candidate',
  HR: 'hr'
}

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

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance'
]

export const EXPERIENCE_LEVELS = [
  'Fresher',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager'
]

export const COMPANY_SIZES = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
]