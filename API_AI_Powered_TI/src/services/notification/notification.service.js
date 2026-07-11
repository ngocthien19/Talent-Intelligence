import notificationModel from '~/models/notification/notification.model'
import { emitToUser, emitToCandidate, emitToCompany } from '~/providers/socket.provider'

const notificationService = {
  // Gửi thông báo cho Candidate
  sendToCandidate: async (candidateId, data) => {
    const notification = await notificationModel.create({
      candidateId,
      type: data.type || 'system',
      title: data.title,
      content: data.content,
      extraData: data.extraData || null,
      isSent: true
    })

    // Real-time qua Socket.IO
    emitToCandidate(candidateId, 'notification:new', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      createdAt: notification.created_at
    })

    return notification
  },

  // Gửi thông báo cho HR
  sendToHR: async (userId, data) => {
    const notification = await notificationModel.create({
      userId,
      type: data.type || 'system',
      title: data.title,
      content: data.content,
      extraData: data.extraData || null,
      isSent: true
    })

    // Real-time qua Socket.IO
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

  // Gửi thông báo cho Company (tất cả HR trong công ty)
  sendToCompany: async (companyId, data) => {
    const notification = await notificationModel.create({
      companyId,
      type: data.type || 'system',
      title: data.title,
      content: data.content,
      extraData: data.extraData || null,
      isSent: true
    })

    // Real-time qua Socket.IO
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

  // Gửi thông báo cho nhiều người cùng lúc
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

  // Lấy danh sách thông báo của candidate
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

  // Lấy danh sách thông báo của HR
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

  // Lấy thông báo chưa đọc
  getUnread: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.getUnreadByCandidate(userId)
    }
    return await notificationModel.getUnreadByUser(userId)
  },

  // Đếm thông báo chưa đọc
  countUnread: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.countUnreadByCandidate(userId)
    }
    return await notificationModel.countUnreadByUser(userId)
  },

  // Đánh dấu đã đọc
  markAsRead: async (id) => {
    return await notificationModel.markAsRead(id)
  },

  // Đánh dấu tất cả đã đọc
  markAllAsRead: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.markAllAsReadByCandidate(userId)
    }
    return await notificationModel.markAllAsReadByUser(userId)
  },

  // Xóa thông báo
  delete: async (id) => {
    return await notificationModel.delete(id)
  },

  // Xóa tất cả thông báo
  deleteAll: async (userId, role) => {
    if (role === 'candidate') {
      return await notificationModel.deleteAllByCandidate(userId)
    }
    return await notificationModel.deleteAllByUser(userId)
  }
}

export default notificationService