import express from 'express'
import semanticSearchController from '~/controllers/hr/semantic-search/semantic-search.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Tạo embedding cho tất cả candidates
router.post('/search/embedding/all', semanticSearchController.generateAllEmbeddings)

// Tạo embedding cho 1 candidate
router.post('/search/embedding/:id', semanticSearchController.generateEmbedding)

// Kiểm tra embedding
router.get('/search/embedding/:id/check', semanticSearchController.checkEmbedding)

// Xóa embedding
router.delete('/search/embedding/:id', semanticSearchController.deleteEmbedding)

// Tìm kiếm ngữ nghĩa (để cuối cùng)
router.get('/search', semanticSearchController.semanticSearch)

export default router