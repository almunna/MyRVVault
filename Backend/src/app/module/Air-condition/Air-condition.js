const mongoose = require('mongoose');

const airConditionSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  modelNumber: {
    type: String,
  },
  dateOfPurchase: {
    type: Date,
  },
  serialNumber: {
    type: String,
  },
  location: {
    type: String,
  },
  cost: {
    type: Number,
  },
  images: [{
    type: String,
    default: []
  }],
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
  },
}, { timestamps: true });


const AirCondition = mongoose.model('AirCondition', airConditionSchema);

module.exports = AirCondition;

