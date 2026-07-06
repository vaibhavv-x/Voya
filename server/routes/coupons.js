const r = require('express').Router();
const c = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/auth');

r.get('/validate/:code', c.validateCoupon);
r.get('/', protect, adminOnly, c.getCoupons);
r.post('/', protect, adminOnly, c.createCoupon);
r.put('/:id', protect, adminOnly, c.updateCoupon);

module.exports = r;
