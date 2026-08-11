import type { HydratedDocument } from 'mongoose'
import type { AuditLogDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { uuidValidator } from '@/utils/'

export type AuditLogDoc = HydratedDocument<AuditLogDB>

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

AuditLogsSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 })
AuditLogsSchema.index({ createdBy: 1, createdAt: -1 })
AuditLogsSchema.index({ action: 1, createdAt: -1 })
AuditLogsSchema.index({ createdAt: -1 })

export const AuditLogsModel = mongoose.model<AuditLogDoc>('audit-logs', AuditLogsSchema)
