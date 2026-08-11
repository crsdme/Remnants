import type { RequestHandler } from 'express'
import {
  createCategoryResponseSchema,
  createCategorySchema,
  editCategoryResponseSchema,
  editCategorySchema,
  getCategoriesResponseSchema,
  getCategoriesSchema,
  removeCategoriesResponseSchema,
  removeCategoriesSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as CategoryController from '@/controllers/category.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getCategoriesSchema),
  validateResponse(getCategoriesResponseSchema),
  CategoryController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createCategorySchema),
  checkPermissions('category.create'),
  validateResponse(createCategoryResponseSchema),
  CategoryController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editCategorySchema),
  checkPermissions('category.edit'),
  validateResponse(editCategoryResponseSchema),
  CategoryController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeCategoriesSchema),
  checkPermissions('category.remove'),
  validateResponse(removeCategoriesResponseSchema),
  CategoryController.remove as RequestHandler,
)

export default router
