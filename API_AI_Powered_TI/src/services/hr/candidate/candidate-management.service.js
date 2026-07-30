import candidateManagementModel from '~/models/hr/candidate/candidate-management.model'
import { CANDIDATE_STATUS } from '~/utils/constants'

const VALID_STATUSES = Object.values(CANDIDATE_STATUS)

const STATUS_FLOW = {
  [CANDIDATE_STATUS.PENDING]: [CANDIDATE_STATUS.ANALYZING, CANDIDATE_STATUS.REJECTED],
  [CANDIDATE_STATUS.ANALYZING]: [CANDIDATE_STATUS.ANALYZED, CANDIDATE_STATUS.REJECTED],
  [CANDIDATE_STATUS.ANALYZED]: [CANDIDATE_STATUS.SHORTLISTED, CANDIDATE_STATUS.REJECTED],
  [CANDIDATE_STATUS.SHORTLISTED]: [CANDIDATE_STATUS.INTERVIEWED, CANDIDATE_STATUS.REJECTED],
  [CANDIDATE_STATUS.INTERVIEWED]: [CANDIDATE_STATUS.OFFERED, CANDIDATE_STATUS.REJECTED],
  [CANDIDATE_STATUS.OFFERED]: [CANDIDATE_STATUS.HIRED, CANDIDATE_STATUS.REJECTED],
  [CANDIDATE_STATUS.HIRED]: [],
  [CANDIDATE_STATUS.REJECTED]: []
}

const candidateManagementService = {

  getCandidates: async (companyId, filters) => {
    return await candidateManagementModel.getCandidates({
      companyId,
      ...filters
    })
  },

  getCandidateDetail: async (candidateId, companyId) => {
    const candidate = await candidateManagementModel.getCandidateDetail(candidateId, companyId)
    if (!candidate) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return candidate
  },

  updateCandidateStatus: async (candidateId, status) => {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error('Trạng thái không hợp lệ')
    }

    const currentCandidate = await candidateManagementModel.getCandidateDetail(candidateId, null)
    if (!currentCandidate) {
      throw new Error('Không tìm thấy ứng viên')
    }

    const currentStatus = currentCandidate.status

    if (currentStatus === status) {
      throw new Error(`Ứng viên đã ở trạng thái "${status}"`)
    }

    const allowedNextStatuses = STATUS_FLOW[currentStatus] || []
    if (!allowedNextStatuses.includes(status)) {
      const statusLabels = {
        [CANDIDATE_STATUS.PENDING]: 'Đang chờ',
        [CANDIDATE_STATUS.ANALYZING]: 'Đang phân tích',
        [CANDIDATE_STATUS.ANALYZED]: 'Đã phân tích',
        [CANDIDATE_STATUS.SHORTLISTED]: 'Đã lọc',
        [CANDIDATE_STATUS.INTERVIEWED]: 'Đã phỏng vấn',
        [CANDIDATE_STATUS.OFFERED]: 'Đã đề xuất',
        [CANDIDATE_STATUS.HIRED]: 'Đã nhận',
        [CANDIDATE_STATUS.REJECTED]: 'Từ chối'
      }
      const currentLabel = statusLabels[currentStatus] || currentStatus
      const newLabel = statusLabels[status] || status
      throw new Error(`Không thể chuyển từ "${currentLabel}" sang "${newLabel}". Luồng trạng thái không cho phép.`)
    }

    const result = await candidateManagementModel.updateCandidateStatus(candidateId, status)
    if (!result) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return result
  },

  updateCandidateStatusBulk: async (ids, status, companyId) => {
    // 👉 Validate status
    if (!VALID_STATUSES.includes(status)) {
      throw new Error('Trạng thái không hợp lệ')
    }

    // Kiểm tra tất cả ID có thuộc company không
    const existingIds = await candidateManagementModel.getExistingIds(ids, companyId)
    if (existingIds.length === 0) {
      throw new Error('Không tìm thấy ứng viên nào')
    }

    const notFound = ids.filter(id => !existingIds.includes(id))
    if (notFound.length > 0) {
      throw new Error(`Không tìm thấy ứng viên với ID: ${notFound.join(', ')}`)
    }

    // 👉 Kiểm tra luồng trạng thái cho từng ứng viên
    const errors = []
    const validIds = []

    for (const id of ids) {
      const candidate = await candidateManagementModel.getCandidateDetail(id, companyId)
      if (!candidate) {
        errors.push(`Ứng viên ID ${id} không tồn tại`)
        continue
      }

      const currentStatus = candidate.status

      // Nếu đã ở trạng thái đó rồi
      if (currentStatus === status) {
        errors.push(`Ứng viên "${candidate.name || id}" đã ở trạng thái "${status}"`)
        continue
      }

      // Kiểm tra luồng
      const allowedNextStatuses = STATUS_FLOW[currentStatus] || []
      if (!allowedNextStatuses.includes(status)) {
        const statusLabels = {
          [CANDIDATE_STATUS.PENDING]: 'Đang chờ',
          [CANDIDATE_STATUS.ANALYZING]: 'Đang phân tích',
          [CANDIDATE_STATUS.ANALYZED]: 'Đã phân tích',
          [CANDIDATE_STATUS.SHORTLISTED]: 'Đã lọc',
          [CANDIDATE_STATUS.INTERVIEWED]: 'Đã phỏng vấn',
          [CANDIDATE_STATUS.OFFERED]: 'Đã đề xuất',
          [CANDIDATE_STATUS.HIRED]: 'Đã nhận',
          [CANDIDATE_STATUS.REJECTED]: 'Từ chối'
        }
        const currentLabel = statusLabels[currentStatus] || currentStatus
        const newLabel = statusLabels[status] || status
        errors.push(`Ứng viên "${candidate.name || id}" không thể chuyển từ "${currentLabel}" sang "${newLabel}"`)
        continue
      }

      validIds.push(id)
    }

    if (errors.length > 0) {
      throw new Error(`Không thể cập nhật một số ứng viên:\n${errors.join('\n')}`)
    }

    if (validIds.length === 0) {
      throw new Error('Không có ứng viên nào hợp lệ để cập nhật')
    }

    // Cập nhật status
    const result = await candidateManagementModel.updateStatusBulk(validIds, status)
    return {
      updatedCount: result.length,
      updatedIds: result.map(r => r.id)
    }
  },

  deleteCandidate: async (candidateId, companyId) => {
    const result = await candidateManagementModel.deleteCandidate(candidateId, companyId)
    if (!result) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return result
  },

  deleteBulk: async (ids, companyId) => {
    // Kiểm tra tất cả ID có thuộc company không
    const existingIds = await candidateManagementModel.getExistingIds(ids, companyId)
    if (existingIds.length === 0) {
      throw new Error('Không tìm thấy ứng viên nào')
    }

    const notFound = ids.filter(id => !existingIds.includes(id))
    if (notFound.length > 0) {
      throw new Error(`Không tìm thấy ứng viên với ID: ${notFound.join(', ')}`)
    }

    // Xóa
    const result = await candidateManagementModel.deleteBulk(ids)
    return {
      deletedCount: result.length,
      deletedIds: result.map(r => r.id)
    }
  },

  getWidgetStats: async (companyId) => {
    const statusCounts = await candidateManagementModel.getAllStatusCounts(companyId)

    const total = await candidateManagementModel.getTotalCount(companyId)

    const pending = statusCounts['pending'] || 0
    const analyzing = statusCounts['analyzing'] || 0
    const analyzed = statusCounts['analyzed'] || 0
    const shortlisted = statusCounts['shortlisted'] || 0
    const interviewed = statusCounts['interviewed'] || 0
    const offered = statusCounts['offered'] || 0
    const hired = statusCounts['hired'] || 0
    const rejected = statusCounts['rejected'] || 0

    return {
      widgets: [
        {
          id: 'total',
          title: 'Tổng ứng viên',
          value: total,
          icon: 'Users',
          color: 'blue',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-600',
          change: {
            value: 0,
            type: 'neutral',
            label: ''
          }
        },
        {
          id: 'pending',
          title: 'Đang chờ',
          value: pending,
          icon: 'Clock',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          change: {
            value: pending,
            type: 'neutral',
            label: 'cần xem xét'
          }
        },
        {
          id: 'analyzed',
          title: 'Đã phân tích',
          value: analyzed,
          icon: 'CheckCircle',
          color: 'green',
          bgColor: 'bg-green-50',
          textColor: 'text-green-600',
          change: {
            value: total > 0 ? Math.round(analyzed / total * 100) : 0,
            type: 'percentage',
            label: '% tổng ứng viên'
          }
        },
        {
          id: 'shortlisted',
          title: 'Đã lọc',
          value: shortlisted,
          icon: 'Star',
          color: 'purple',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
          change: {
            value: total > 0 ? Math.round(shortlisted / total * 100) : 0,
            type: 'percentage',
            label: '% tổng ứng viên'
          }
        },
        {
          id: 'interviewed',
          title: 'Đã phỏng vấn',
          value: interviewed,
          icon: 'CalendarCheck',
          color: 'indigo',
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-600',
          change: {
            value: total > 0 ? Math.round(interviewed / total * 100) : 0,
            type: 'percentage',
            label: '% tổng ứng viên'
          }
        },
        {
          id: 'offered',
          title: 'Đã đề xuất',
          value: offered,
          icon: 'FileCheck',
          color: 'teal',
          bgColor: 'bg-teal-50',
          textColor: 'text-teal-600',
          change: {
            value: total > 0 ? Math.round(offered / total * 100) : 0,
            type: 'percentage',
            label: '% tổng ứng viên'
          }
        },
        {
          id: 'hired',
          title: 'Đã nhận',
          value: hired,
          icon: 'Award',
          color: 'emerald',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          change: {
            value: total > 0 ? Math.round(hired / total * 100) : 0,
            type: 'percentage',
            label: 'tỷ lệ trúng tuyển'
          }
        },
        {
          id: 'rejected',
          title: 'Từ chối',
          value: rejected,
          icon: 'XCircle',
          color: 'red',
          bgColor: 'bg-red-50',
          textColor: 'text-red-600',
          change: {
            value: total > 0 ? Math.round(rejected / total * 100) : 0,
            type: 'percentage',
            label: 'tỷ lệ từ chối'
          }
        }
      ],
      summary: {
        total,
        pending,
        analyzing,
        analyzed,
        shortlisted,
        interviewed,
        offered,
        hired,
        rejected
      }
    }
  }
}

export default candidateManagementService