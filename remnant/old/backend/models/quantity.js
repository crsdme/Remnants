const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'product'
  },
  stock: {
    type: Schema.Types.ObjectId,
    ref: 'stocks'
  },
  amount: {
    type: Schema.Types.Number,
    default: 0
  },
  status: {
    type: Schema.Types.String,
    default: 'Discontinued',
    enum: ["Discontinued", "OutOfStock", "InStock"]
  },
  // reserve: [{
  //   stock: {
  //     type: Schema.Types.ObjectId,
  //     ref: 'stock'
  //   },
  //   order: {
  //     type: Schema.Types.ObjectId,
  //     ref: 'order'
  //   },
  //   amount: {
  //     type: Schema.Types.Number,
  //   }
  // }],
}, { timestamps: true });


const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
