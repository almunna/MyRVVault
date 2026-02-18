const mongoose = require('mongoose');

const ventFansSchema = new mongoose.Schema({
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
    location: {
        type: String,
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

const VentFans = mongoose.model('VentFans', ventFansSchema);

module.exports = VentFans;
