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
    type: {
        type: Schema.Types.String,
        enum: ['novaposhta', 'selfpickup', 'courier', 'other']
    },
    priority: {
        type: Schema.Types.Number,
        default: 0
    },
    active: {
        type: Schema.Types.Boolean
    },
    removed: {
        type: Schema.Types.Boolean,
        default: false
    }
}, { timestamps: true });

const modelname = path.basename(__filename, '.js');
const model = mongoose.model(modelname, generalSchema);
module.exports = model;
