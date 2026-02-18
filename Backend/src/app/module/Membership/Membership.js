const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  dateOfPurchase: {
    type: Date,
  },
  websiteLink: {
    type: String,
  },
  phoneNo: {
    type: String,
  },
  accountNo: {
    type: String,
  },
  amountPaid: {
    type: Number,
  },
  membershipExpirationDate: {
    type: Date,
  },
  serialNumber: {
    type: String,
  },
  note: {
    type: String,
  },
  images: {
    type: [String],
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

const Membership = mongoose.model('Membership', membershipSchema);
module.exports = Membership;
