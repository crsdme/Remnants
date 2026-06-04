import type { RequestHandler } from 'express'
import { createCategorySchema, editCategorySchema, getCategoriesSchema, removeCategoriesSchema } from '@remnant/shared'
import { Router } from 'express'
import * as CategoryController from '@/controllers/category.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCategoriesSchema),
  CategoryController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCategorySchema),
  checkPermissions('category.create'),
  CategoryController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCategorySchema),
  checkPermissions('category.edit'),
  CategoryController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCategoriesSchema),
  checkPermissions('category.remove'),
  CategoryController.remove as RequestHandler,
)

export default router
