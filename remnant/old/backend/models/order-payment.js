const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    cashregister: {
        type: Schema.Types.ObjectId,
        ref: 'cashregister'
    },
    cashregisterAccount: {
        type: Schema.Types.ObjectId,
        ref: 'cashregister-account'
    },
    amount: {
        type: Schema.Types.Number,
        default: 0
    },
    currency: {
        type: Schema.Types.ObjectId,
        ref: 'currency'
    },
    paymentStatus: {
        type: Schema.Types.String,
        enum: ['paid', 'notPaid']
    },
    paymentDate: {
        type: Schema.Types.Date
    },
    comment: {
        type: Schema.Types.String
    },
    removed: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
