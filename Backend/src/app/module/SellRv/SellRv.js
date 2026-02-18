const mongoose = require('mongoose');

const sellRvSchema = new mongoose.Schema({
    rvType: {
        type: String,
    },
    sellingDate: {
        type: Date,
    },
    currentMileage: {
        type: Number,
    },
    amount: {
        type: Number,
    },
    selectedSellRvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isSold: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const SellRv = mongoose.model('SellRv', sellRvSchema);
module.exports = SellRv;