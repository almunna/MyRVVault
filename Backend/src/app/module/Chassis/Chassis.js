const mongoose = require('mongoose');

const chassisSchema = new mongoose.Schema({
    mfg: {
        type: String,
        required: true
    },
    modelNo: {
        type: String
    },
    name: {
        type: String
    },
    serialId: {
        type: String
    },
    fuelType: {
        type: String
    },
    engineModel: {
        type: String
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    hp: {
        type: Number,
    },
    belt: [{
        name: {
            type: String
        },
        partNo: {
            type: Number
        }
    }],
    fuelFilter: [{
        name: {
            type: String
        },
        partNo: {
            type: Number
        }
    }],
    oilFilter: [{
        name: {
            type: String
        },
        partNo: {
            type: Number
        }
    }]
},
    {
        timestamps: true
    });

const Chassis = mongoose.model('Chassis', chassisSchema);

module.exports = Chassis;

