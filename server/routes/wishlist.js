const r = require('express').Router();
const c = require('../controllers/miscControllers');
const { protect } = require('../middleware/auth');
r.get('/', protect, c.getWishlist);
r.post('/:tripId', protect, c.toggleWishlist);
module.exports = r;
