import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'
import { registry } from './registry'
import '../docs/modules/currencies.openapi'
import '../docs/modules/languages.openapi'
import '../docs/modules/units.openapi'
import '../docs/modules/users.openapi'
import '../docs/modules/categories.openapi'

const generator = new OpenApiGeneratorV31(registry.definitions)

export const openapiDocument = generator.generateDocument({
  openapi: '3.1.0',
  info: { title: 'Remnant API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3001' }],
})
