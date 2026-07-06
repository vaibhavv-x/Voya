const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true },
  phone:     String,
  subject:   String,
  message:   String,
  tripTypes: [String],
  status:    { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
