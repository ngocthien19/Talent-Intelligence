import candidateManagementModel from '~/models/hr/candidate/candidate-management.model'
import { CANDIDATE_STATUS } from '~/utils/constants'

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
    // Validate status
    if (!CANDIDATE_STATUS.includes(status)) {
      throw new Error('Trạng thái không hợp lệ')
    }

    const result = await candidateManagementModel.updateCandidateStatus(candidateId, status)
    if (!result) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return result
  },

  updateCandidateStatusBulk: async (ids, status, companyId) => {
    // Validate status
    if (!CANDIDATE_STATUS.includes(status)) {
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

    // Cập nhật status
    const result = await candidateManagementModel.updateStatusBulk(ids, status)
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
    const [
      total,
      pending,
      analyzed,
      shortlisted,
      hired,
      rejected,
      todayNew,
      weekNew
    ] = await Promise.all([
      candidateManagementModel.getTotalCount(companyId),
      candidateManagementModel.getCountByStatus(companyId, 'pending'),
      candidateManagementModel.getCountByStatus(companyId, 'analyzed'),
      candidateManagementModel.getCountByStatus(companyId, 'shortlisted'),
      candidateManagementModel.getCountByStatus(companyId, 'hired'),
      candidateManagementModel.getCountByStatus(companyId, 'rejected'),
      candidateManagementModel.getTodayNewCount(companyId),
      candidateManagementModel.getWeekNewCount(companyId)
    ])

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
            value: weekNew,
            type: 'increase',
            label: 'tuần này'
          }
        },
        {
          id: 'pending',
          title: 'Chờ xử lý',
          value: pending,
          icon: 'Clock',
          color: 'yellow',
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-600',
          change: {
            value: 0,
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
            type: 'increase',
            label: 'đã phân tích'
          }
        },
        {
          id: 'shortlisted',
          title: 'Ứng viên tiềm năng',
          value: shortlisted,
          icon: 'Star',
          color: 'purple',
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-600',
          change: {
            value: 0,
            type: 'neutral',
            label: 'shortlist'
          }
        },
        {
          id: 'hired',
          title: 'Đã tuyển',
          value: hired,
          icon: 'Award',
          color: 'emerald',
          bgColor: 'bg-emerald-50',
          textColor: 'text-emerald-600',
          change: {
            value: total > 0 ? Math.round(hired / total * 100) : 0,
            type: 'increase',
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
            type: 'decrease',
            label: 'tỷ lệ từ chối'
          }
        }
      ],
      todayNew,
      weekNew
    }
  }
}

export default candidateManagementService