const mongoose = require('mongoose');

const insuranceSchema = new mongoose.Schema({
  insuranceCompany: {
    type: String,
  },
  websiteLink: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  effectiveDate: {
    type: Date,
  },
  renewalDate: {
    type: Date,
  },
  expirationDate: {
    type: Date,
  },
  serialNumber: {
    type: String,
  },
  cost: {
    type: Number,
  },
  policyNumber: {
    type: String,
  },
  images: {
    type: [String]
  },
  notes: {
    type: String,
    default: '',
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

const Insurance = mongoose.model('Insurance', insuranceSchema);

module.exports = Insurance;
