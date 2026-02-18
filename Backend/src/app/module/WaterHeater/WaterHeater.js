const mongoose = require('mongoose');

const waterHeaterSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    modelNumber: {
        type: String,

    },
    dateOfPurchase: {
        type: Date,

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
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

const WaterHeater = mongoose.model('WaterHeater', waterHeaterSchema);

module.exports = WaterHeater;
