import type { RequestHandler } from 'express'
import {
  createSiteResponseSchema,
  createSiteSchema,
  editSiteResponseSchema,
  editSiteSchema,
  getSitesResponseSchema,
  getSitesSchema,
  getSiteSyncMappingResponseSchema,
  getSiteSyncMappingSchema,
  getSiteSyncSiteItemsResponseSchema,
  getSiteSyncSiteItemsSchema,
  removeSitesResponseSchema,
  removeSitesSchema,
  saveSiteSyncMappingResponseSchema,
  saveSiteSyncMappingSchema,
  syncSiteProductsResponseSchema,
  syncSiteProductsSchema,
} from '@remnant/shared'
import { Router } from 'express'
import * as SiteController from '@/controllers/site.controller'
import { checkPermissions, validateBodyRequest, validateQueryRequest, validateResponse } from '@/middleware'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSitesSchema),
  validateResponse(getSitesResponseSchema),
  SiteController.get as RequestHandler,
)

router.post(
  '/create',
  validateBodyRequest(createSiteSchema),
  checkPermissions('site.create'),
  validateResponse(createSiteResponseSchema),
  SiteController.create as RequestHandler,
)

router.post(
  '/edit',
  validateBodyRequest(editSiteSchema),
  checkPermissions('site.edit'),
  validateResponse(editSiteResponseSchema),
  SiteController.edit as RequestHandler,
)

router.post(
  '/remove',
  validateBodyRequest(removeSitesSchema),
  checkPermissions('site.remove'),
  validateResponse(removeSitesResponseSchema),
  SiteController.remove as RequestHandler,
)

router.post(
  '/sync-products',
  validateBodyRequest(syncSiteProductsSchema),
  checkPermissions('site.sync'),
  validateResponse(syncSiteProductsResponseSchema),
  SiteController.syncProducts as RequestHandler,
)

router.get(
  '/sync-mapping',
  validateQueryRequest(getSiteSyncMappingSchema),
  checkPermissions('site.sync'),
  validateResponse(getSiteSyncMappingResponseSchema),
  SiteController.getSyncMapping as RequestHandler,
)

router.get(
  '/sync-site-items',
  validateQueryRequest(getSiteSyncSiteItemsSchema),
  checkPermissions('site.sync'),
  validateResponse(getSiteSyncSiteItemsResponseSchema),
  SiteController.getSyncSiteItems as RequestHandler,
)

router.post(
  '/sync-mapping',
  validateBodyRequest(saveSiteSyncMappingSchema),
  checkPermissions('site.sync'),
  validateResponse(saveSiteSyncMappingResponseSchema),
  SiteController.saveSyncMapping as RequestHandler,
)

export default router
