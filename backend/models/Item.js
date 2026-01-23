const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide item name'],
    trim: true,
    unique: true
  },
  icon: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: [true, 'Please provide base price'],
    min: 0
  },
  unit: {
    type: String,
    default: 'item',
    enum: ['item', 'set', 'kg']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', itemSchema);
