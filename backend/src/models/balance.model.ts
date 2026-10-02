import type { HydratedDocument } from 'mongoose'
import type { BalanceDB } from '@/types'
import mongoose, { Schema } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { CounterModel } from '@/models/'
import { uuidValidator } from '@/utils/'

type BalanceDoc = HydratedDocument<BalanceDB>

const CurrencyTotalSchema = new Schema(
  {
    currencyId: { type: String, required: true },
    minorAmount: { type: Number, required: true },
  },
  { _id: false },
)

const CashregisterBalanceSchema = new Schema(
  {
    cashregisterId: { type: String, required: true },
    totals: [CurrencyTotalSchema],
  },
  { _id: false },
)

const WarehouseBalanceSchema = new Schema(
  {
    warehouseId: { type: String, required: true },
    totals: [CurrencyTotalSchema],
  },
  { _id: false },
)

const TransitBalanceSchema = new Schema(
  {
    warehouseTransactionId: { type: String, required: true },
    fromWarehouseId: { type: String, default: null },
    totals: [CurrencyTotalSchema],
  },
  { _id: false },
)

const OrderedNotReceivedBalanceSchema = new Schema(
  {
    procurementId: { type: String, required: true },
    supplierId: { type: String, required: true },
    totals: [CurrencyTotalSchema],
  },
  { _id: false },
)

const PrepaidBalanceSchema = new Schema(
  {
    procurementId: { type: String, default: null },
    supplierId: { type: String, default: null },
    totals: [CurrencyTotalSchema],
  },
  { _id: false },
)

const ReceivableBalanceSchema = new Schema(
  {
    orderId: { type: String, required: true },
    clientId: { type: String, default: null },
    totals: [CurrencyTotalSchema],
  },
  { _id: false },
)

const SupplierDebtBalanceSchema = new Schema(
  {
    procurementId: { type: String, required: true },
    supplierId: { type: String, required: true },
    totals: [CurrencyTotalSchema],
  },
  { _id: false },
)

const BalanceSchema: Schema = new Schema(
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
    totalBalances: {
      type: [CurrencyTotalSchema],
      default: [],
    },
    cashregisterBalance: {
      type: [CashregisterBalanceSchema],
      default: [],
    },
    warehouseBalance: {
      type: [WarehouseBalanceSchema],
      default: [],
    },
    transitBalance: {
      type: [TransitBalanceSchema],
      default: [],
    },
    orderedNotReceivedBalance: {
      type: [OrderedNotReceivedBalanceSchema],
      default: [],
    },
    prepaidBalance: {
      type: [PrepaidBalanceSchema],
      default: [],
    },
    receivableBalance: {
      type: [ReceivableBalanceSchema],
      default: [],
    },
    supplierDebtBalance: {
      type: [SupplierDebtBalanceSchema],
      default: [],
    },
    comment: {
      type: String,
      default: '',
    },
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
  },
  { timestamps: true },
)

BalanceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id
    delete ret._id
  },
})

BalanceSchema.pre('save', async function (this: BalanceDoc, next) {
  if (this.isNew && !this.seq) {
    const counter = await CounterModel.findByIdAndUpdate(
      'balances',
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    )
    this.seq = counter.seq
  }

  next()
})

export const BalanceModel = mongoose.model<BalanceDoc>('balance', BalanceSchema)
