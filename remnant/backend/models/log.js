const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
  type: {
    type: Schema.Types.String,
    required: true,
    enum: ['get', 'remove', 'create', 'edit']
  },
  route: {
    type: Schema.Types.String,
    required: true
  },
  ip: {
    type: Schema.Types.String,
    required: true
  },
  userId: {
    type: Schema.Types.String,
    required: true,
    ref: 'user'
  },
  params: {
    type: Schema.Types.String,
    required: true
  },
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
