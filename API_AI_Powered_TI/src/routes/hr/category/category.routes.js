import express from 'express'
import categoryController from '~/controllers/hr/category/category.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  createCategoryValidation,
  updateCategoryValidation,
  idValidation,
  getCategoriesValidation,
  updateStatusBulkValidation,
  deleteBulkValidation,
  updateStatusValidation
} from '~/validations/hr/category/category.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Lấy thống kê
router.get('/categories/stats', categoryController.getStats)

// Lấy danh sách dropdown
router.get('/categories/dropdown', categoryController.getDropdown)

// Tạo category
router.post(
  '/categories',
  validate(createCategoryValidation, 'body'),
  categoryController.create
)

// Danh sách category (có filter theo ngày tạo)
router.get(
  '/categories',
  validate(getCategoriesValidation, 'query'),
  categoryController.getList
)

// Chi tiết category
router.get(
  '/categories/:id',
  validate(idValidation, 'params'),
  categoryController.getById
)

// Cập nhật category
router.put(
  '/categories/:id',
  validate(idValidation, 'params'),
  validate(updateCategoryValidation, 'body'),
  categoryController.update
)

// Cập nhật trạng thái (single)
router.put(
  '/categories/:id/status',
  validate(idValidation, 'params'),
  validate(updateStatusValidation, 'body'),
  categoryController.updateStatus
)

// Cập nhật trạng thái hàng loạt (bulk)
router.put(
  '/categories/status/bulk',
  validate(updateStatusBulkValidation, 'body'),
  categoryController.updateStatusBulk
)

// Xóa category (single)
router.delete(
  '/categories/:id',
  validate(idValidation, 'params'),
  categoryController.delete
)

// Xóa hàng loạt (bulk)
router.delete(
  '/categories/bulk',
  validate(deleteBulkValidation, 'body'),
  categoryController.deleteBulk
)

export default router