import express from 'express'
import categoryController from '~/controllers/hr/category/category.controller'
import { authGuard } from '~/middlewares/auth.guard'
import { ROLES } from '~/utils/constants'
import validate from '~/middlewares/validate.middleware'
import {
  createCategoryValidation,
  updateCategoryValidation,
  idValidation,
  getCategoriesValidation
} from '~/validations/hr/category/category.validation'

const router = express.Router()

router.use(authGuard.isAuthorized)
router.use(authGuard.authorize(ROLES.HR))

// Tạo category
router.post(
  '/categories',
  validate(createCategoryValidation, 'body'),
  categoryController.create
)

// Danh sách category
router.get(
  '/categories',
  validate(getCategoriesValidation, 'query'),
  categoryController.getList
)

// Dropdown category - THÊM ROUTE NÀY
router.get(
  '/categories/dropdown',
  categoryController.getDropdown
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

// Xóa category
router.delete(
  '/categories/:id',
  validate(idValidation, 'params'),
  categoryController.delete
)

export default router