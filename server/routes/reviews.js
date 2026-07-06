const r = require('express').Router();
const c = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
r.post('/', protect, c.createReview);
r.get('/trip/:tripId', c.getTripReviews);
r.delete('/:id', protect, c.deleteReview);
module.exports = r;
