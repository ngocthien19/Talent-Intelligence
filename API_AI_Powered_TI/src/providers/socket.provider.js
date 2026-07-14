import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '~/config/environment'
import { corsOptions } from '~/config/corsOptions'

let io = null
const userSocketMap = {}

export const initSocket = (server) => {
  if (io) {
    console.log('Socket.IO already initialized')
    return io
  }

  io = new Server(server, {
    cors: corsOptions,
    path: '/socket.io',
    transports: ['websocket', 'polling']
  })

  // Middleware xác thực token
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token || socket.handshake.headers?.token

    if (!token) {
      const cookieHeader = socket.handshake.headers.cookie
      if (cookieHeader) {
        const match = cookieHeader.match(/accessToken=([^;]+)/)
        if (match) token = match[1]
      }
    }

    if (!token) {
      return next(new Error('Thao tac khong hop le. Token bi thieu.'))
    }

    try {
      const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET)
      socket.userId = decoded.id
      socket.userRole = decoded.roleName
      next()
    } catch (error) {
      return next(new Error('Xac thuc Socket that bai: Token da het han hoac khong dung.'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.userId
    userSocketMap[userId] = socket.id

    // User joins room
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`)
      }
    })

    // Candidate joins their own room
    socket.on('join-candidate', (candidateId) => {
      if (candidateId) {
        socket.join(`candidate:${candidateId}`)
      }
    })

    // Company room
    socket.on('join-company', (companyId) => {
      if (companyId) {
        socket.join(`company:${companyId}`)
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      delete userSocketMap[userId]
    })
  })

  console.log('Socket.IO initialized successfully')
  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}

export const emitToUser = (userId, event, data) => {
  const socketId = userSocketMap[userId]
  if (socketId && io) {
    io.to(socketId).emit(event, data)
  }
}

export const emitToCandidate = (candidateId, event, data) => {
  if (!io) return
  io.to(`candidate:${candidateId}`).emit(event, data)
}

export const emitToCompany = (companyId, event, data) => {
  if (!io) return
  io.to(`company:${companyId}`).emit(event, data)
}

export const broadcast = (event, data) => {
  if (!io) return
  io.emit(event, data)
}

export const getSocketId = (userId) => {
  return userSocketMap[userId] || null
}

export default {
  initSocket,
  getIO,
  emitToUser,
  emitToCandidate,
  emitToCompany,
  broadcast,
  getSocketId,
  userSocketMap
}