const mongoose = require('mongoose');


const reportSchema = new mongoose.Schema({
    reportTitle: {
        type: String,
    },
    dateOfService: {
        type: Date,
    },
    area: {
        type: String,
    },
    odometerReading: {
        type: Number,
    },
    component: {
        type: String,
    },
    subComponent: {
        type: String,
    },
    expenseType: {
        type: String,
    },
    cost: {
        type: Number,
    },
    note: {
        type: String,
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
})

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
