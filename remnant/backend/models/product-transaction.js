const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
    from: {
        stock: {
            type: Schema.Types.ObjectId,
            ref: 'stock'
        },
    },
    to: {
        stock: {
            type: Schema.Types.ObjectId,
            ref: 'stock'
        },
    },
    products: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: {
            type: Schema.Types.Number
        }
    }],
    type: {
        type: Schema.Types.String,
        enum: ['purchase', 'order']
    },
    // status: {
    //     type: Schema.Types.String,
    //     enum: ['transfer', 'added', 'removed']
    // },
    purchaseId : {
        type: Schema.Types.ObjectId,
        ref: 'purchase'
    },
    orderId : {
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    comment: {
        type: Schema.Types.String
    },
    createdBy: {
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
