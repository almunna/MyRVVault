const mongoose = require('mongoose');

const outdoorRadioSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    modelNumber: {
        type: String,

    },
    dateOfPurchase: {
        type: Date,

    },
    location: {
        type: String,
    },
    cost: {
        type: Number,

    },
    serialNumber: {
        type: String,
    },
    notes: {
        type: String,
        default: '',
    },
    images: {
        type: [String], // image URLs or file paths
        default: [],
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

const OutdoorRadio = mongoose.model('OutdoorRadio', outdoorRadioSchema);

module.exports = OutdoorRadio;
