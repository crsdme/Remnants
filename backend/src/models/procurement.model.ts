import type { HydratedDocument } from 'mongoose'
import type { ProcurementDB, ProcurementItemDB } from '@/types/'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type ProcurementDoc = HydratedDocument<ProcurementDB>
type ProcurementItemDoc = HydratedDocument<ProcurementItemDB>

const ProcurementSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
      validate: uuidValidator,
    },
    seq: {
      type: Number,
      default: 0,
    },
    supplierId: {
      type: String,
      ref: 'supplier',
      required: true,
    },
    warehouseId: {
      type: String,
      ref: 'Warehouse',
      default: null,
    },
    status: {
      type: String,
      enum: ['draft', 'ordered', 'partially-received', 'received', 'closed', 'cancelled'],
      default: 'draft',
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially-paid', 'paid', 'overpaid'],
      default: 'unpaid',
      required: true,
    },
    expenseIds: [{
      type: String,
      ref: 'Expense',
    }],
    paymentIds: [{
      type: String,
      ref: 'money-transaction',
    }],
    createdBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    removed: {
      type: Boolean,
      default: false,
    },
    removedBy: {
      type: String,
      ref: 'User',
      default: null,
    },
    comment: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
)

const ProcurementItemSchema: Schema = new Schema({
  _id: {
    type: String,
    default: uuidv4,
    validate: uuidValidator,
  },
  procurementId: {
    type: String,
    required: true,
    ref: 'Procurement',
  },
  productId: {
    type: String,
    required: true,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  receivedQuantity: {
    type: Number,
    default: 0,
  },
  minorPurchasePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  purchasePrice: {
    type: Number,
  },
  purchaseCurrencyId: {
    type: String,
    required: true,
    ref: 'Currency',
  },
})

ProcurementSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

ProcurementSchema.pre('save', async function (this: ProcurementDoc, next) {
  if (this.isNew) {
    const counter = await CounterModel.findByIdAndUpdate(
      'procurements',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter?.seq || 0
  }
  next()
})

ProcurementSchema.index({ status: 1 })
ProcurementSchema.index({ paymentStatus: 1 })
ProcurementSchema.index({ supplierId: 1 })
ProcurementSchema.index({ seq: 1 })
ProcurementSchema.index({ createdAt: -1 })

ProcurementItemSchema.index({ procurementId: 1 })
ProcurementItemSchema.index({ productId: 1 })

export const ProcurementModel = mongoose.model<ProcurementDoc>('procurement', ProcurementSchema)
export const ProcurementItemModel = mongoose.model<ProcurementItemDoc>('procurement-item', ProcurementItemSchema)
