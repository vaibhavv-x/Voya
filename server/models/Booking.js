const mongoose = require('mongoose');

const travelerSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  age:       { type: Number, required: true },
  gender:    { type: String, enum: ['Male', 'Female', 'Other'] },
  passport:  String,
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  bookingId:   { type: String, unique: true }, // VYA-XXXXXX
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip:        { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },

  travelDate:   { type: Date, required: true },
  departureId:  { type: mongoose.Schema.Types.ObjectId }, // references a Trip.departures subdoc
  travelers:    [travelerSchema],
  groupSize:    { type: Number, required: true, min: 1 },

  // Pricing snapshot at booking time
  pricePerPerson: { type: Number, required: true },
  subtotal:        Number,
  discount:        { type: Number, default: 0 },
  taxes:           { type: Number, default: 0 },
  walletUsed:      { type: Number, default: 0 },
  totalAmount:     { type: Number, required: true },
  sharesPaid:      { type: Number, default: 0 }, // group split: how many travellers have paid their share

  couponCode:      String,
  specialRequests: String,

  // Payment
  paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod:  { type: String, enum: ['razorpay', 'bank_transfer', 'manual'], default: 'razorpay' },
  paymentId:      String,
  orderId:        String,
  paidAt:         Date,

  // Booking status
  bookingStatus:  { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  confirmedAt:    Date,
  cancelledAt:    Date,
  cancellationReason: String,

  // Contact info snapshot
  contactName:  String,
  contactEmail: String,
  contactPhone: String,
}, { timestamps: true });

// Auto-generate booking ID
bookingSchema.pre('save', async function () {
  if (!this.bookingId) {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingId = `VYA-${rand}`;
  }
});

module.exports = mongoose.model('Booking', bookingSchema);
