import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'
import authorizedAxiosInstance from '~/utils/authorizedAxios'
import { DEV_API_URL, ROLES } from '~/utils/constant'

const useNotificationSocket = (onNewNotification) => {
  const socketRef = useRef(null)
  const callbackRef = useRef(onNewNotification)
  callbackRef.current = onNewNotification

  const { isAuthenticated, user, accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if (!isAuthenticated || !user?.id || !accessToken) return

    let isCancelled = false

    const socket = io(DEV_API_URL, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    socket.on('connect', async () => {
      if (user.roleName === ROLES.CANDIDATE) {
        try {
          const res = await authorizedAxiosInstance.get(`${DEV_API_URL}/api/candidates/profile`)
          const profileId = res.data?.data?.id
          if (profileId && !isCancelled) {
            socket.emit('join-candidate', profileId)
          }
        } catch (error) {
          console.error('Không thể lấy candidate profile để join socket room:', error)
        }
      } else {
        socket.emit('join', user.id)
        if (user.companyId) {
          socket.emit('join-company', user.companyId)
        }
      }
    })

    socket.on('notification:new', (data) => {
      if (!callbackRef.current) return
      callbackRef.current({
        id: data.id,
        type: data.type,
        title: data.title,
        content: data.content,
        data: data.data,
        is_read: false,
        read_at: null,
        created_at: data.createdAt || new Date().toISOString()
      })
    })

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message)
    })

    return () => {
      isCancelled = true
      socket.disconnect()
      socketRef.current = null
    }
  }, [isAuthenticated, user?.id, user?.roleName, user?.companyId, accessToken])

  return socketRef
}

export default useNotificationSocket