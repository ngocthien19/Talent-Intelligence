import dashboardModel from '~/models/hr/dashboard/dashboard.model'

const dashboardService = {
  getDashboard: async (companyId, filters = {}) => {
    const { period = '30days', startDate, endDate } = filters

    const dateCondition = dashboardModel.buildDateCondition(period, startDate, endDate)

    // Lấy tất cả thông tin song song, bắt lỗi cho từng promise
    const [
      totalCandidates,
      candidatesByStatus,
      newCandidates,
      recentCandidates,
      averageScores,
      topSkillsResult,
      dailyStats
    ] = await Promise.all([
      dashboardModel.getTotalCandidates(companyId, dateCondition).catch(() => 0),
      dashboardModel.getCandidatesByStatus(companyId, dateCondition).catch(() => []),
      dashboardModel.getNewCandidates(companyId, dateCondition).catch(() => 0),
      dashboardModel.getRecentCandidates(companyId, dateCondition, 5).catch(() => []),
      dashboardModel.getAverageScores(companyId, dateCondition).catch(() => ({})),
      dashboardModel.getTopSkills(companyId, dateCondition, 10).catch(() => []),
      dashboardModel.getDailyStats(companyId, dateCondition).catch(() => [])
    ])

    // Đảm bảo topSkills luôn là array
    const topSkills = Array.isArray(topSkillsResult) ? topSkillsResult : []

    // Format lại dữ liệu trạng thái
    const statusCounts = {
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0
    }

    if (Array.isArray(candidatesByStatus)) {
      candidatesByStatus.forEach(item => {
        const status = item.status?.toLowerCase() || 'pending'
        if (Object.keys(statusCounts).includes(status)) {
          statusCounts[status] = parseInt(item.count) || 0
        } else {
          statusCounts.pending += parseInt(item.count) || 0
        }
      })
    }

    return {
      period,
      summary: {
        total: totalCandidates || 0,
        new: newCandidates || 0,
        analyzed: (statusCounts.shortlisted || 0) + (statusCounts.interviewed || 0) + (statusCounts.offered || 0),
        shortlisted: statusCounts.shortlisted || 0,
        hired: statusCounts.hired || 0,
        rejected: statusCounts.rejected || 0
      },
      statusCounts,
      averageScores: {
        overall: parseFloat(averageScores?.avg_overall || 0),
        skillsMatch: parseFloat(averageScores?.avg_skills_match || 0),
        cultureFit: parseFloat(averageScores?.avg_culture_fit || 0),
        retention: parseFloat(averageScores?.avg_retention || 0)
      },
      topSkills: topSkills.map(s => ({
        skill: s.skill || 'Chưa xác định',
        count: parseInt(s.count) || 0
      })),
      recentCandidates: Array.isArray(recentCandidates) ? recentCandidates.map(c => ({
        id: c.id,
        name: c.name || 'Ứng viên',
        email: c.email || '',
        position_applied: c.position || c.job_title || 'Chưa xác định',
        job_title: c.job_title,
        overall_score: c.overall_score,
        status: c.status || 'pending',
        created_at: c.created_at
      })) : [],
      dailyStats: Array.isArray(dailyStats) ? dailyStats.map(d => ({
        date: d.date,
        count: parseInt(d.count) || 0
      })) : []
    }
  }
}

export default dashboardService