import type { AuditLog } from '../types/audit-logs.type'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '../utils/uuidValidator'

const AuditLogsSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    resourceType: {
      type: String,
      required: true,
      enum: [
        'order',
        'barcode',
        'product',
        'client',
        'user',
        'cashregister',
        'cashregister-account',
        'warehouse',
        'warehouse-transaction',
        'expense',
        'expense-category',
        'money-transaction',
        'automation',
        'automation-rule',
        'automation-action',
        'automation-condition',
        'automation-trigger',
      ],
    },
    resourceId: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['create', 'edit', 'remove'],
    },
    changes: [{
      path: { type: String, required: true },
      before: { type: Schema.Types.Mixed, default: null },
      after: { type: Schema.Types.Mixed, default: null },
    }],
    comment: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
    },
  },
  { timestamps: true },
)

AuditLogsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

export const AuditLogsModel = mongoose.model<AuditLog>('audit-logs', AuditLogsSchema)
