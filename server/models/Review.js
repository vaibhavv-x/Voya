const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trip:    { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, required: true, trim: true },
  body:    { type: String, required: true },
  images:  [String],
  helpful: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

// One review per user per trip
reviewSchema.index({ user: 1, trip: 1 }, { unique: true });

// Update trip rating on save
reviewSchema.post('save', async function () {
  const Trip = require('./Trip');
  const stats = await this.constructor.aggregate([
    { $match: { trip: this.trip, isApproved: true } },
    { $group: { _id: '$trip', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Trip.findByIdAndUpdate(this.trip, {
      rating: Math.round(stats[0].avg * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
