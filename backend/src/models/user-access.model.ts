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
    warehouseIds: refIdArray('Warehouse'),
    siteIds: refIdArray('site'),
    expenseCategoryIds: refIdArray('expense-category'),
    cashregisterIds: refIdArray('cashregister'),
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
