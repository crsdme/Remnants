import type { HydratedDocument } from 'mongoose'
import type { UserAccessDB } from '@/types'
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
    warehouses: refIdArray('Warehouse'),
    sites: refIdArray('site'),
    expenseCategories: refIdArray('expense-category'),
    cashregisters: refIdArray('cashregister'),
    cashregisterAccounts: refIdArray('cashregister-account'),
    deliveryServices: refIdArray('delivery-service'),
    orderSources: refIdArray('order-source'),
    orderStatuses: refIdArray('order-status'),
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
