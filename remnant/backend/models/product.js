const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  names: {
    ua: {
      type: Schema.Types.String,
    },
    ru: {
      type: Schema.Types.String,
    },
    en: {
      type: Schema.Types.String,
    },
    tr: {
      type: Schema.Types.String,
    },
  },
  attributeGroup: {
    type: Schema.Types.ObjectId,
    ref: 'attributeGroup'
  },
  attributes: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'attributes'
    },
    data: {
      type: Schema.Types.Mixed,
    }
  }],
  images: [{
    main: {
      name:{
        type: Schema.Types.String,
      },
      path: {
        type: Schema.Types.String,
      }
    },
    preview: {
      name:{
        type: Schema.Types.String,
      },
      path: {
        type: Schema.Types.String,
      }
    }
  }],
  price: {
    type: Schema.Types.Number,
    required: true
  },
  currency: {
    type: Schema.Types.ObjectId,
    ref: 'currency'
  },
  discount: {
    type: Schema.Types.Number,
    default: 0
  },
  wholesalePrice: {
    type: Schema.Types.Number,
    default: 0
  },
  wholesaleCurrency: {
    type: Schema.Types.ObjectId,
    ref: 'currency'
  },
  quantity: [{
    stock: {
      type: Schema.Types.ObjectId,
      ref: 'stock'
    },
    status: {
      type: Schema.Types.String, // Discontinued, OutOfStock, InStock
      default: 'Discontinued'
    },
    amount: {
      type: Schema.Types.Number,
      default: 0
    },
  }],
  reserve: [{
    stock: {
      type: Schema.Types.ObjectId,
      ref: 'stock'
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'order'
    },
    amount: {
      type: Schema.Types.Number,
    }
  }],
  barcode: [{
      number: {
        type: Schema.Types.ObjectId,
        ref: 'barcode'
      }
  }],
  categories: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'category'
    },
  }],
  disabled: {
    type: Schema.Types.Boolean,
    default: false
  },
}, { timestamps: true });


const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
