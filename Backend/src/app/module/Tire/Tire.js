const mongoose = require('mongoose');

const tireSchema = new mongoose.Schema({
    manufacturer: {
        type: String
    },
    tireSize: {
        type: String
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
    note: {
        type: String
    },
    serialNumber: {
        type: String,
    },
    images: [{
        type: String,
    }],
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
}, {
    timestamps: true
});

const Tire = mongoose.model('Tire', tireSchema);


module.exports = Tire;