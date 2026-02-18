const mongoose = require('mongoose');

const dishwasherSchema = new mongoose.Schema({
    name: {
        type: String,

    },
    modelNumber: {
        type: String,

    },
    dateOfPurchase: {
        type: Date,

    },
    serialNumber: {
        type: String,
    },
    location: {
        type: String,
    },
    cost: {
        type: Number,

    },
    notes: {
        type: String,
        default: '',
    },
    images: {
        type: [String], // image URLs or file paths
        default: [],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV',
        required: true,
    },
}, { timestamps: true });

const Dishwasher = mongoose.model('Dishwasher', dishwasherSchema);

module.exports = Dishwasher;
