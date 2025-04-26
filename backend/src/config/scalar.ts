import { apiReference } from '@scalar/express-api-reference'
import { openapiDocument } from '../docs/generators'

export const scalar = apiReference({
  spec: {
    content: openapiDocument,
  },
})
