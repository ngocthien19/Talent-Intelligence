import express from 'express'
import categoryController from '~/controllers/candidate/category/category.controller'

const router = express.Router()

// Lấy tất cả category
router.get('/categories', categoryController.getAllCategories)

// Lấy category theo slug
router.get('/categories/slug/:slug', categoryController.getCategoryBySlug)

// Lấy category theo ID
router.get('/categories/:id', categoryController.getCategoryById)

export default router