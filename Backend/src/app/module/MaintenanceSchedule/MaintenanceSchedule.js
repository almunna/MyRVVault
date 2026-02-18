const { toString } = require('express-validator/lib/utils');
const mongoose = require('mongoose')

const maintenanceSchedule = new mongoose.Schema({
    component: {
        type: String
    },
    subComponent: {
        type: String
    },
    maintenanceToBePerformed: {
        type: String
    },
    rvType: {
        type: String
    },
    initialMilage: {
        type: Number
    },
    initial: {
        type: String
    },
    dateOfMaintenance: {
        type: Date
    },
    milageAtMaintenance: {
        type: Number
    },
    notes: {
        type: String
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    completionDate: {
        type: Date
    },
    completionMileage: {
        type: Number
    },
    vendor: {
        type: String
    },
    cost: {
        type: Number
    },
    date: {
        type: Date
    }
}, { timestamps: true })

const MaintenanceSchedule = mongoose.model('MaintenanceSchedule', maintenanceSchedule)

module.exports = MaintenanceSchedule;