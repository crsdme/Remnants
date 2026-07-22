// import type { SupplierDB } from '@/types'
// import mongoose, { Schema } from 'mongoose'
// import { v4 as uuidv4 } from 'uuid'
// import { uuidValidator } from '@/utils/'

// const SupplierSchema: Schema = new Schema(
//   {
//     _id: {
//       type: String,
//       default: uuidv4,
//       validate: uuidValidator,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     emails: [{
//       type: String,
//     }],
//     phones: [{
//       type: String,
//     }],
//     socials: [{
//       type: {
//         type: String,
//         required: true,
//       },
//       value: {
//         type: String,
//         required: true,
//       },
//     }],
//     comment: {
//       type: String,
//     },
//     removed: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   { timestamps: true },
// )

// SupplierSchema.set('toJSON', {
//   virtuals: true,
//   versionKey: false,
//   transform: (_, ret) => {
//     ret.id = ret._id
//     delete ret._id
//     delete ret.removed
//   },
// })

// export const SupplierModel = mongoose.model<Supplier>('Supplier', SupplierSchema)
