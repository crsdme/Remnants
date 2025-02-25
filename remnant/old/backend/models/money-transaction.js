const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
    from: {
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
    },
    to: {
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
    },
    exchangeRate: {
        type: Schema.Types.Number,
        default: 1
    },
    status: {
        type: Schema.Types.String,
        enum: ['pending', 'completed', 'failed', 'cancelled']
    },
    paymentDate: {
        type: Schema.Types.Date
    },
    comment: {
        type: Schema.Types.String
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    canceledBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    acceptedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    removed: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
