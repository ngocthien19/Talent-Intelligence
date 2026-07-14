import Redis from 'ioredis'
import { env } from './environment.js'

export const redisConnection = new Redis({
  host: env.REDIS_HOST || 'localhost',
  port: parseInt(env.REDIS_PORT, 10) || 6379,
  password: env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000)
  }
})

redisConnection.on('connect', () => {
  console.log('Redis connection established successfully.')
})

redisConnection.on('error', (error) => {
  console.error('Redis connection error:', error)
})

export default redisConnection