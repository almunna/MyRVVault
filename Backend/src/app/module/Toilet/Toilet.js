const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
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
    notes: {
        type: String,
        default: '',
    },
    serialNumber: {
        type: String,
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

const Toilet = mongoose.model('Toilet', toiletSchema);

module.exports = Toilet;
