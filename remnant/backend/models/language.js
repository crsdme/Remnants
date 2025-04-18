const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true
  },
  code: {
    type: Schema.Types.String,
    required: true
  },
  main: {
    type: Schema.Types.Boolean,
    required: true
  },
  active: {
    type: Schema.Types.Boolean,
    required: true
  },
  disabled: {
    type: Schema.Types.Boolean,
    default: false
  },
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
