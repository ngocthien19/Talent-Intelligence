import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import helmet from 'helmet'
import morgan from 'morgan'
import passport from 'passport'

import { corsOptions } from '~/config/corsOptions'
import { connectDB } from '~/config/db'
import { env } from '~/config/environment'
import '~/config/passport'

import { initSocket } from '~/providers/socket.provider'

import redisConnection from '~/config/redis'

import { createWorker } from '~/providers/queue.provider'
import { analysisWorker } from '~/jobs/analysis.job'

import authRoutes from '~/routes/auth/auth.routes'
import jobRoutes from '~/routes/candidate/job/job.routes'
import candidateRoutes from '~/routes/candidate/candidate.routes'
import profileRoutes from '~/routes/hr/profile/profile.routes'
import mockInterviewRoutes from '~/routes/candidate/mock-interview/mock-interview.routes'

import dashboardRoutes from '~/routes/hr/dashboard/dashboard.routes'
import analysisRoutes from '~/routes/hr/analysis/analysis.routes'
import reportRoutes from '~/routes/hr/report/report.routes'
import candidateManagementRoutes from '~/routes/hr/candidate/candidate-management.routes'
import jobDescriptionRoutes from '~/routes/hr/job-description/job-description.routes'
import comparisonRoutes from '~/routes/hr/comparison/comparison.routes'
import semanticSearchRoutes from '~/routes/hr/semantic-search/semantic-search.routes'
import resumeEnrichmentRoutes from '~/routes/hr/resume-enrichment/resume-enrichment.routes'
import calendarRoutes from '~/routes/hr/calendar/calendar.routes'
import rediscoveryRoutes from '~/routes/hr/rediscovery/rediscovery.routes'

import candidateNotificationRoutes from '~/routes/candidate/notification/notification.routes'
import hrNotificationRoutes from '~/routes/hr/notification/notification.routes'

dotenv.config()

const app = express()
const server = http.createServer(app)

initSocket(server)

// Middleware
app.set('trust proxy', true)
app.use(helmet())
app.use(cors(corsOptions))
app.use(compression())
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use(passport.initialize())

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/mock-interview', mockInterviewRoutes)

app.use('/api/hr/dashboard', dashboardRoutes)
app.use('/api/hr/candidates', analysisRoutes)
app.use('/api/hr/reports', reportRoutes)
app.use('/api/hr', candidateManagementRoutes)
app.use('/api/hr', jobDescriptionRoutes)
app.use('/api/hr', profileRoutes)
app.use('/api/hr', comparisonRoutes)
app.use('/api/hr', semanticSearchRoutes)
app.use('/api/hr/resume', resumeEnrichmentRoutes)
app.use('/api/hr/calendar', calendarRoutes)
app.use('/api/hr/rediscovery', rediscoveryRoutes)

app.use('/api/candidate', candidateNotificationRoutes)
app.use('/api/hr', hrNotificationRoutes)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  })
})

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Talent Intelligence API is running!',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  })
})

// KHỞI TẠO WORKER CHO QUEUE
const analysisWorkerInstance = createWorker('analysis', analysisWorker)

analysisWorkerInstance.on('completed', (job) => {
  console.log(`Job ${job.id} completed for candidate ${job.data.candidateId}`)
})

analysisWorkerInstance.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err.message)
})

// START SERVER
const startServer = async () => {
  try {
    await connectDB()

    if (redisConnection.status === 'ready') {
      console.log('Redis connection established successfully.')
    }

    const port = env.APP_PORT || 3000
    server.listen(port, () => {
      console.log(`Talent Intelligence Platform running at http://localhost:${port}`)
      console.log(`Environment: ${env.NODE_ENV}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing...')
  await analysisWorkerInstance.close()
  await redisConnection.quit()
  server.close(() => process.exit(0))
})

startServer()