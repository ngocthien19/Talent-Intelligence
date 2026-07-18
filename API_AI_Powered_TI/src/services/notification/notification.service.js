import notificationModel from '~/models/notification/notification.model'
import { emitToUser, emitToCandidate, emitToCompany } from '~/providers/socket.provider'
import candidateProfileModel from '~/models/candidate/candidate-profile.model'

const notificationService = {
  // Gửi thông báo cho Candidate - CẬP NHẬT
  sendToCandidate: async (userId, data) => {
    // Tìm candidate profile từ user_id
    const profile = await candidateProfileModel.findByUserId(userId)

    if (!profile) {
      // Nếu chưa có profile, tạo notification với user_id thay vì candidate_id
      const notification = await notificationModel.create({
        userId, // Dùng user_id
        type: data.type || 'system',
        title: data.title,
        content: data.content,
        extraData: data.extraData || null,
        isSent: true
      })
      return notification
    }

    // Nếu có profile, dùng profile.id
    const notification = await notificationModel.create({
      candidateId: profile.id, // Dùng profile.id
      type: data.type || 'system',
      title: data.title,
      content: data.content,
      extraData: data.extraData || null,
      isSent: true
    })

    // Real-time qua Socket.IO
    emitToCandidate(profile.id, 'notification:new', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      createdAt: notification.created_at
    })

    return notification
  },

  // Gửi thông báo cho HR - KHÔNG ĐỔI
  sendToHR: async (userId, data) => {
    const notification = await notificationModel.create({
      userId,
      type: data.type || 'system',
      title: data.title,
      content: data.content,
      extraData: data.extraData || null,
      isSent: true
    })

    emitToUser(userId, 'notification:new', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      createdAt: notification.created_at
    })

    return notification
  },

  // Gửi thông báo cho Company - KHÔNG ĐỔI
  sendToCompany: async (companyId, data) => {
    const notification = await notificationModel.create({
      companyId,
      type: data.type || 'system',
      title: data.title,
      content: data.content,
      extraData: data.extraData || null,
      isSent: true
    })

    emitToCompany(companyId, 'notification:new', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      createdAt: notification.created_at
    })

    return notification
  },

  // ... các hàm còn lại giữ nguyên
  sendToMany: async (recipients, data) => {
    const notifications = []
    for (const recipient of recipients) {
      let notification
      if (recipient.type === 'candidate') {
        notification = await notificationService.sendToCandidate(recipient.id, data)
      } else if (recipient.type === 'hr') {
        notification = await notificationService.sendToHR(recipient.id, data)
      }
      notifications.push(notification)
    }
    return notifications
  },

  getByCandidate: async (candidateId, limit = 20, page = 1) => {
    const offset = (page - 1) * limit
    const notifications = await notificationModel.getByCandidate(
      candidateId,
      parseInt(limit),
      parseInt(offset)
    )
    const unreadCount = await notificationModel.countUnreadByCandidate(candidateId)

    return {
      notifications,
      pagination: {
        limit: parseInt(limit),
        page: parseInt(page),
        total: notifications.length,
        unreadCount
      }
    }
  },

  getByHR: async (userId, limit = 20, page = 1) => {
    const offset = (page - 1) * limit
    const notifications = await notificationModel.getByUser(
      userId,
      parseInt(limit),
      parseInt(offset)
    )
    const unreadCount = await notificationModel.countUnreadByUser(userId)

    return {
      notifications,
      pagination: {
        limit: parseInt(limit),
        page: parseInt(page),
        total: notifications.length,
        unreadCount
      }
    }
  },

  getUnread: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.getUnreadByCandidate(userId)
    }
    return await notificationModel.getUnreadByUser(userId)
  },

  countUnread: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.countUnreadByCandidate(userId)
    }
    return await notificationModel.countUnreadByUser(userId)
  },

  markAsRead: async (id) => {
    return await notificationModel.markAsRead(id)
  },

  markAllAsRead: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.markAllAsReadByCandidate(userId)
    }
    return await notificationModel.markAllAsReadByUser(userId)
  },

  delete: async (id) => {
    return await notificationModel.delete(id)
  },

  deleteAll: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.deleteAllByCandidate(userId)
    }
    return await notificationModel.deleteAllByUser(userId)
  }
}

export default notificationService