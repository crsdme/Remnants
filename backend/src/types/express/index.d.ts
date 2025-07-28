export * from 'express-serve-static-core'

declare module 'express-serve-static-core' {
  interface Request {
    user: RequestUser
  }
}

// import type { RequestUser } from '../common.type'

// declare global {
//   namespace Express {
//     interface Request {
//       user?: RequestUser
//     }
//   }
// }
