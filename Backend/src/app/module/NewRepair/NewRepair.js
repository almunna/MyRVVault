const mongoose = require('mongoose');


const newRepairSchema = new mongoose.Schema({
    component: {
        type: String,
    },
    expenseType: {
        type: String,
    },
    subComponent: {
        type: String,
    },
    date: {
        type: Date,
    },
    vendor: {
        type: String,
    },
    cityState: {
        type: String,
    },
    cost: {
        type: Number,
    },
    qty: {
        type: Number,
    },
    images: {
        type: [String],
        default: [],
    },
    notes: {
        type: String,
        default: '',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RV",
    },
}, {
    timestamps: true
})

const NewRepair = mongoose.model('NewRepair', newRepairSchema);

module.exports = NewRepair;
