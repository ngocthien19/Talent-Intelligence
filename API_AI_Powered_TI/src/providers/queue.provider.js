import { Queue, Worker, QueueEvents } from 'bullmq'
import redisConnection from '~/config/redis'

export const createQueue = (name, options = {}) => {
  return new Queue(name, {
    connection: redisConnection,
    ...options
  })
}

export const createWorker = (name, processor, options = {}) => {
  return new Worker(name, processor, {
    connection: redisConnection,
    concurrency: 5,
    ...options
  })
}

export const createQueueEvents = (name) => {
  return new QueueEvents(name, {
    connection: redisConnection
  })
}

export const addJob = async (queue, jobName, data, options = {}) => {
  return queue.add(jobName, data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true,
    removeOnFail: false,
    ...options
  })
}

export const getJobStatus = async (queue, jobId) => {
  const job = await queue.getJob(jobId)
  if (!job) return null

  const state = await job.getState()
  return {
    id: job.id,
    state,
    data: job.data,
    failedReason: job.failedReason,
    returnvalue: job.returnvalue
  }
}

export default {
  createQueue,
  createWorker,
  createQueueEvents,
  addJob,
  getJobStatus
}