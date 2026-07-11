import rediscoveryService from '~/services/hr/rediscovery/rediscovery.service'
import { SocketProvider } from '~/providers/socket.provider'
import notificationService from '~/services/notification/notification.service'

export const rediscoveryWorker = async (job) => {
  const { jdId, companyId, userId, threshold = 60 } = job.data

  try {
    // 1. Chạy rediscovery
    const result = await rediscoveryService.matchCandidatesWithJD(jdId, threshold)

    // 2. Gửi thông báo real-time qua Socket.IO cho HR
    SocketProvider.emitToUser(userId, 'rediscovery:complete', {
      jdId,
      totalMatched: result.totalMatched,
      topMatches: result.topMatches.slice(0, 5)
    })

    // 3. Gửi thông báo qua Notification Service
    if (result.totalMatched > 0) {
      await notificationService.sendToHR(userId, {
        type: 'rediscovery_completed',
        title: `Hoàn tất tìm kiếm: ${result.totalMatched} ứng viên`,
        content: `Đã tìm thấy ${result.totalMatched} ứng viên phù hợp với vị trí "${result.jdTitle}"`,
        extraData: {
          jdId: jdId,
          jdTitle: result.jdTitle,
          totalMatched: result.totalMatched,
          topMatches: result.topMatches.slice(0, 5).map(m => ({
            id: m.candidate_id,
            name: m.candidate_name,
            matchScore: m.matchScore
          }))
        }
      })
    }
    return result

  } catch (error) {
    // Gửi thông báo lỗi qua Socket.IO
    SocketProvider.emitToUser(userId, 'rediscovery:error', {
      jdId,
      error: error.message
    })

    // Gửi thông báo lỗi qua Notification Service
    await notificationService.sendToHR(userId, {
      type: 'rediscovery_failed',
      title: 'Tìm kiếm ứng viên thất bại',
      content: `Quét kho ứng viên cũ thất bại: ${error.message}`,
      extraData: {
        jdId: jdId,
        error: error.message
      }
    })

    throw error
  }
}