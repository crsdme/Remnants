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
  customFieldsGroup: {
    type: Schema.Types.ObjectId,
    ref: 'custom-field-group'
  },
  customFields: [{
    _id: {
      type: Schema.Types.ObjectId,
      ref: 'custom-field'
    },
    data: {
      type: Schema.Types.Mixed,
      ref: 'custom-field-options'
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
  unit: {
    type: Schema.Types.ObjectId,
    ref: 'units'
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
    type: Schema.Types.ObjectId,
    ref: 'quantity'
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
