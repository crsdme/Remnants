import type { HydratedDocument } from 'mongoose'
import type { UserAccessDB } from '@/types'
import {
  CASHREGISTER_CAPABILITIES,
  WAREHOUSE_CAPABILITIES,
} from '@remnant/shared'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

type UserAccessDoc = HydratedDocument<UserAccessDB>

function refIdArray(ref: string) {
  return {
    type: [{
      type: String,
      ref,
    }],
    default: [],
  }
}

const warehouseAccessEntrySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      ref: 'Warehouse',
      validate: uuidValidator,
    },
    capabilities: {
      type: [{
        type: String,
        enum: WAREHOUSE_CAPABILITIES,
      }],
      required: true,
      validate: {
        validator: (caps: string[]) => Array.isArray(caps) && caps.length > 0,
        message: 'warehouse capabilities must not be empty',
      },
    },
  },
  { _id: false },
)

const cashregisterAccountAccessEntrySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      ref: 'cashregister-account',
      validate: uuidValidator,
    },
    capabilities: {
      type: [{
        type: String,
        enum: CASHREGISTER_CAPABILITIES,
      }],
      required: true,
      validate: {
        validator: (caps: string[]) => Array.isArray(caps) && caps.length > 0,
        message: 'cashregister account capabilities must not be empty',
      },
    },
  },
  { _id: false },
)

const cashregisterAccessEntrySchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      ref: 'cashregister',
      validate: uuidValidator,
    },
    accounts: {
      type: [cashregisterAccountAccessEntrySchema],
      required: true,
      validate: {
        validator: (accounts: unknown[]) => Array.isArray(accounts) && accounts.length > 0,
        message: 'cashregister must have at least one account access entry',
      },
    },
  },
  { _id: false },
)

const UserAccessSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
      unique: true,
    },
    warehouses: {
      type: [warehouseAccessEntrySchema],
      default: [],
    },
    cashregisters: {
      type: [cashregisterAccessEntrySchema],
      default: [],
    },
    siteIds: refIdArray('site'),
    expenseCategoryIds: refIdArray('expense-category'),
    cashregisterAccountIds: refIdArray('cashregister-account'),
    deliveryServiceIds: refIdArray('delivery-service'),
    orderSourceIds: refIdArray('order-source'),
    orderStatusIds: refIdArray('order-status'),
  },
  { timestamps: true },
)

UserAccessSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

export const UserAccessModel = mongoose.model<UserAccessDoc>('user-access', UserAccessSchema, 'user-accesses')
