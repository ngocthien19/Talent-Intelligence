import express from 'express'
import jobController from '~/controllers/candidate/job/job.controller'

const router = express.Router()

// Public routes (không cần đăng nhập)
router.get('/', jobController.getJobs)
router.get('/featured', jobController.getFeaturedJobs)
router.get('/count', jobController.getJobCount)
router.get('/filters', jobController.getFilterOptions)
router.get('/skills', jobController.getSkills)
router.get('/company/:companyId', jobController.getJobsByCompany)
router.get('/related/:id', jobController.getRelatedJobs)
router.get('/category/:categoryId', jobController.getJobsByCategory)
router.get('/by-skills', jobController.getJobsBySkills)
router.get('/:id', jobController.getJobDetail)

export default router