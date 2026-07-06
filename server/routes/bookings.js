const r = require('express').Router();
const c = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');
r.post('/', protect, c.createBooking);
r.post('/:id/create-order', protect, c.createOrder);
r.post('/:id/verify-payment', protect, c.verifyPayment);
r.get('/:id/upi-intent', protect, c.getUpiIntent);
r.post('/:id/upi-claim', protect, c.claimUpiPaid);
r.get('/:id/split', c.getSplit);          // public — shareable split-pay link
r.post('/:id/split-claim', c.claimSplit); // public — traveller marks share paid
r.get('/my', protect, c.getMyBookings);
r.get('/admin/all', protect, adminOnly, c.getAllBookings);
r.get('/:id', protect, c.getBookingById);
r.put('/:id/cancel', protect, c.cancelBooking);
r.put('/:id/payment', protect, c.confirmPayment);
r.put('/:id/status', protect, adminOnly, c.adminUpdateStatus);
module.exports = r;
