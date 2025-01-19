const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  id: {
    type: Schema.Types.Number,
    required: true
  },
  name: {
    type: Schema.Types.String,
    required: true
  },
  middlename: {
    type: Schema.Types.String
  },
  lastname: {
    type: Schema.Types.String
  },
  emails: [{
    type: Schema.Types.String
  }],
  phones: [{
    type: Schema.Types.String
  }],
  dayOfBirth: {
    type: Schema.Types.Date
  },
  comment: {
    type: Schema.Types.String
  },
  orders: [{
    type: Schema.Types.ObjectId,
    ref: 'order'
  }],
  disabled: {
    type: Schema.Types.Boolean,
    default: false
  },
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
