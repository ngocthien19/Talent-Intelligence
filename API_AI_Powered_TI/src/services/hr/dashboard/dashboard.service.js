import dashboardModel from '~/models/hr/dashboard/dashboard.model'

const dashboardService = {
  getDashboard: async (companyId, filters = {}) => {
    const { period = '30days', startDate, endDate } = filters

    // Xây dựng điều kiện thời gian
    const dateCondition = dashboardModel.buildDateCondition(period, startDate, endDate)

    // Lấy tất cả thông tin song song
    const [
      totalCandidates,
      candidatesByStatus,
      newCandidates,
      recentCandidates,
      averageScores,
      topSkills,
      dailyStats
    ] = await Promise.all([
      dashboardModel.getTotalCandidates(companyId, dateCondition),
      dashboardModel.getCandidatesByStatus(companyId, dateCondition),
      dashboardModel.getNewCandidates(companyId, dateCondition),
      dashboardModel.getRecentCandidates(companyId, dateCondition, 5),
      dashboardModel.getAverageScores(companyId, dateCondition),
      dashboardModel.getTopSkills(companyId, dateCondition, 10),
      dashboardModel.getDailyStats(companyId, dateCondition)
    ])

    // Format lại dữ liệu trạng thái
    const statusCounts = {
      pending: 0,
      analyzing: 0,
      analyzed: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0
    }

    candidatesByStatus.forEach(item => {
      statusCounts[item.status] = parseInt(item.count)
    })

    return {
      period,
      summary: {
        total: totalCandidates,
        new: newCandidates,
        analyzed: statusCounts.analyzed,
        shortlisted: statusCounts.shortlisted,
        hired: statusCounts.hired,
        rejected: statusCounts.rejected
      },
      statusCounts,
      averageScores: {
        overall: parseFloat(averageScores?.avg_overall || 0),
        skillsMatch: parseFloat(averageScores?.avg_skills_match || 0),
        cultureFit: parseFloat(averageScores?.avg_culture_fit || 0),
        retention: parseFloat(averageScores?.avg_retention || 0)
      },
      topSkills,
      recentCandidates: recentCandidates.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        position_applied: c.position_applied,
        job_title: c.job_title,
        overall_score: c.overall_score,
        status: c.status,
        created_at: c.created_at
      })),
      dailyStats: dailyStats.map(d => ({
        date: d.date,
        count: parseInt(d.count)
      }))
    }
  }
}

export default dashboardService