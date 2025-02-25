const path = require('path');
const mongoose = require('mongoose');

const { Schema } = mongoose;

const generalSchema = new Schema({
    names: {
        type: Map,
        of: String,
        validate: {
            validator: function(value) {
                const allowedLanguages = ['ru', 'en'];
                return Array.from(value.keys()).every(key => allowedLanguages.includes(key));
            },
            message: 'ru en keys only'
        }
    },
    is_multiple: {
        type: Schema.Types.Boolean,
        default: false
    },
    model: {
        type: Schema.Types.String,
        enum: ['product', 'order'],
    },
    type: {
        type: Schema.Types.String,
        enum: ['text', 'select', 'color'],
    },
    options: [{
        type: Schema.Types.ObjectId,
        ref: 'custom-field-option',
        default: []
    }],
    priority: {
        type: Schema.Types.Number,
        default: 0
    }
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
