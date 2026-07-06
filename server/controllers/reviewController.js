const Review = require('../models/Review');
const Trip = require('../models/Trip');

// Recompute a trip's rating + reviewCount from its real reviews
async function recalcTrip(tripId) {
  const reviews = await Review.find({ trip: tripId, isApproved: true }).select('rating');
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  await Trip.findByIdAndUpdate(tripId, { rating: Math.round(avg * 10) / 10, reviewCount: count });
}

// POST /api/reviews
exports.createReview = async (req, res) => {
  try {
    const { tripId, rating, title, body } = req.body;
    const existing = await Review.findOne({ user: req.user.id, trip: tripId });
    if (existing) return res.status(400).json({ message: 'You already reviewed this trip' });
    const review = await Review.create({ user: req.user.id, trip: tripId, rating, title, body });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/trip/:tripId
exports.getTripReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ trip: req.params.tripId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    const tripId = review.trip;
    await review.deleteOne();
    await recalcTrip(tripId); // keep the trip's rating/count honest after removal
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
