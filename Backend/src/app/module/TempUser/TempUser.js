const mongoose = require('mongoose');

const tempUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },
    rvId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RV'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationCode: {
        type: String
    },
    verificationCodeExpiresAt: {
        type: Date
    },
    passwordResetCode: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

});

const TempUser = mongoose.model('TempUser', tempUserSchema);

module.exports = TempUser;