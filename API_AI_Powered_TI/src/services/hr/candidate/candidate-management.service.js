import candidateManagementModel from '~/models/hr/candidate/candidate-management.model'

const candidateManagementService = {
  // Lấy danh sách ứng viên
  getCandidates: async (companyId, filters) => {
    return await candidateManagementModel.getCandidates({
      companyId,
      ...filters
    })
  },

  // Lấy chi tiết ứng viên
  getCandidateDetail: async (candidateId, companyId) => {
    const candidate = await candidateManagementModel.getCandidateDetail(candidateId, companyId)
    if (!candidate) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return candidate
  },

  // Cập nhật trạng thái
  updateCandidateStatus: async (candidateId, status) => {
    const validStatus = ['pending', 'analyzing', 'analyzed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected']
    if (!validStatus.includes(status)) {
      throw new Error('Trạng thái không hợp lệ')
    }
    const result = await candidateManagementModel.updateCandidateStatus(candidateId, status)
    if (!result) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return result
  },

  // Xóa ứng viên
  deleteCandidate: async (candidateId, companyId) => {
    const result = await candidateManagementModel.deleteCandidate(candidateId, companyId)
    if (!result) {
      throw new Error('Không tìm thấy ứng viên')
    }
    return result
  },

  // Lấy thống kê nhanh cho widgets
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