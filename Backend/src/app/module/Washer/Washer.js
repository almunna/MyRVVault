const mongoose = require('mongoose');

const washerSchema = new mongoose.Schema({
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
    location: {
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

const Washer = mongoose.model('Washer', washerSchema);

module.exports = Washer;
