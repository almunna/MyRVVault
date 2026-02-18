const mongoose = require('mongoose');

const dvdSchema = new mongoose.Schema({
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
    serialNumber: {
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
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });
    
const Dvd = mongoose.model('Dvd', dvdSchema);

module.exports = Dvd;
