import { Router } from 'express'
import * as SiteController from '../../controllers/site.controller'
import { validateBodyRequest, validateQueryRequest } from '../../middleware'
import { checkPermissions } from '../../middleware/permission.middleware'
import { createSiteSchema, editSiteSchema, getSitesSchema, removeSitesSchema } from '../../schemas/site.schema'

const router = Router()

router.get(
  '/get',
  validateQueryRequest(getSitesSchema),
  SiteController.get,
)
router.post(
  '/create',
  validateBodyRequest(createSiteSchema),
  checkPermissions('site.create'),
  SiteController.create,
)
router.post(
  '/edit',
  validateBodyRequest(editSiteSchema),
  checkPermissions('site.edit'),
  SiteController.edit,
)
router.post(
  '/remove',
  validateBodyRequest(removeSitesSchema),
  checkPermissions('site.remove'),
  SiteController.remove,
)

export default router
