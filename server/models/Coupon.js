const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true, uppercase: true, trim: true },
  percentOff: { type: Number, min: 0, max: 100, default: 0 }, // percentage discount
  flatOff:    { type: Number, min: 0, default: 0 },           // OR a flat ₹ discount
  expiresAt:  { type: Date, required: true },
  active:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
