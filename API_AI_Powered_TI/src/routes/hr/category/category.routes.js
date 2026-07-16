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

router.post(
  '/categories',
  validate(createCategoryValidation, 'body'),
  categoryController.create
)

router.get(
  '/categories',
  validate(getCategoriesValidation, 'query'),
  categoryController.getList
)

router.get('/categories/dropdown', categoryController.getDropdown)

router.get(
  '/categories/:id',
  validate(idValidation, 'params'),
  categoryController.getById
)

router.put(
  '/categories/:id',
  validate(idValidation, 'params'),
  validate(updateCategoryValidation, 'body'),
  categoryController.update
)

router.delete(
  '/categories/:id',
  validate(idValidation, 'params'),
  categoryController.delete
)

export default router