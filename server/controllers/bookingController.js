const crypto = require('crypto');
const Booking = require('../models/Booking');
const Trip = require('../models/Trip');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const razorpay = require('../utils/razorpay');
const { isValidCoupon } = require('./couponController');
const mailer = require('../utils/mailer');

const REFERRAL_BONUS = 1000;

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const { tripId, travelDate, departureId, travelers, specialRequests, couponCode, useCredit, contactName, contactEmail, contactPhone } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.soldOut) return res.status(400).json({ message: 'This trip is sold out' });

    const groupSize = travelers.length;

    // If this trip runs on fixed departures, require a valid one with enough seats.
    let departure = null;
    let finalTravelDate = travelDate;
    if (trip.departures && trip.departures.length > 0) {
      if (!departureId) return res.status(400).json({ message: 'Please select a departure date' });
      departure = trip.departures.id(departureId);
      if (!departure) return res.status(400).json({ message: 'Selected departure is no longer available' });
      const seatsLeft = departure.seatsTotal - departure.seatsBooked;
      if (seatsLeft < groupSize) return res.status(400).json({ message: `Only ${seatsLeft} seat(s) left on this departure` });
      finalTravelDate = departure.date;
    }

    const subtotal = trip.pricePerPerson * groupSize;

    let discount = 0;
    let appliedCouponCode;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (!isValidCoupon(coupon)) return res.status(400).json({ message: 'Invalid or expired coupon code' });
      discount = coupon.flatOff > 0
        ? Math.min(coupon.flatOff, subtotal)
        : Math.round(subtotal * coupon.percentOff / 100);
      appliedCouponCode = coupon.code;
    }

    const taxableAmount = subtotal - discount;
    const taxes = Math.round(taxableAmount * 0.05); // 5% GST
    const grandTotal = taxableAmount + taxes;

    // Apply referral wallet credit if requested
    let walletUsed = 0;
    if (useCredit && req.user.walletCredit > 0) {
      walletUsed = Math.min(req.user.walletCredit, grandTotal);
    }
    const totalAmount = grandTotal - walletUsed;

    const booking = await Booking.create({
      user: req.user.id,
      trip: tripId,
      travelDate: finalTravelDate,
      departureId: departure ? departure._id : undefined,
      travelers,
      groupSize,
      pricePerPerson: trip.pricePerPerson,
      subtotal,
      discount,
      taxes,
      walletUsed,
      totalAmount,
      couponCode: appliedCouponCode,
      specialRequests,
      contactName: contactName || req.user.name,
      contactEmail: contactEmail || req.user.email,
      contactPhone,
    });

    // Reserve the seats on the departure
    if (departure) {
      departure.seatsBooked += groupSize;
      await trip.save();
    }

    // Deduct any wallet credit used, and reward the referrer on this user's first booking
    if (walletUsed > 0 || (req.user.referredBy && !req.user.referralRewarded)) {
      const buyer = await User.findById(req.user.id);
      if (walletUsed > 0) buyer.walletCredit = Math.max(0, buyer.walletCredit - walletUsed);
      if (buyer.referredBy && !buyer.referralRewarded) {
        await User.findByIdAndUpdate(buyer.referredBy, { $inc: { walletCredit: REFERRAL_BONUS } });
        buyer.referralRewarded = true;
      }
      await buyer.save();
    }

    await booking.populate('trip', 'title coverImage destination days nights');

    // Fire-and-forget emails (never block the response)
    mailer.sendBookingConfirmation(booking, trip).catch(() => {});
    mailer.sendAdminAlert(`New booking ${booking.bookingId}`,
      `<p style="font-size:14px">${booking.contactName} booked <strong>${trip.title}</strong> for ${booking.groupSize} — ₹${booking.totalAmount?.toLocaleString('en-IN')} (${booking.paymentStatus}).</p>`).catch(() => {});

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('trip', 'title coverImage destination country days nights slug')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('trip')
      .populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Release reserved seats back to a departure when a booking is cancelled
async function releaseSeats(booking) {
  if (!booking.departureId) return;
  const trip = await Trip.findById(booking.trip);
  const dep = trip && trip.departures.id(booking.departureId);
  if (dep) {
    dep.seatsBooked = Math.max(0, dep.seatsBooked - booking.groupSize);
    await trip.save();
  }
}

// PUT /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.bookingStatus === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled' });

    booking.bookingStatus = 'cancelled';
    booking.cancelledAt = Date.now();
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();
    await releaseSeats(booking);
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id/split  — PUBLIC group split-payment info (shareable link)
exports.getSplit = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('trip', 'title coverImage destination');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const vpa = process.env.UPI_ID;
    if (!vpa || vpa === 'your_upi_id') return res.status(503).json({ message: 'UPI is not configured' });

    const perHead = Math.ceil(booking.totalAmount / booking.groupSize);
    const name = process.env.UPI_NAME || 'Voya Travel';
    const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${perHead}&cu=INR&tn=${encodeURIComponent(`Voya ${booking.bookingId} share`)}`;

    res.json({
      bookingId: booking.bookingId,
      tripTitle: booking.trip?.title,
      destination: booking.trip?.destination,
      coverImage: booking.trip?.coverImage,
      groupSize: booking.groupSize,
      perHead,
      totalAmount: booking.totalAmount,
      sharesPaid: booking.sharesPaid,
      complete: booking.sharesPaid >= booking.groupSize,
      upiId: vpa,
      upiLink,
      travelers: booking.travelers.map(t => t.name),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/:id/split-claim  — PUBLIC: a traveller marks their share paid
exports.claimSplit = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.sharesPaid < booking.groupSize) booking.sharesPaid += 1;
    if (booking.sharesPaid >= booking.groupSize) booking.paymentMethod = 'manual';
    await booking.save();
    res.json({ sharesPaid: booking.sharesPaid, groupSize: booking.groupSize, complete: booking.sharesPaid >= booking.groupSize });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/:id/upi-intent  — direct UPI payment to the agency's VPA
exports.getUpiIntent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const vpa = process.env.UPI_ID;
    if (!vpa || vpa === 'your_upi_id') return res.status(503).json({ message: 'UPI is not configured' });

    const name = process.env.UPI_NAME || 'Voya Travel';
    const amount = booking.totalAmount;
    const note = `Voya ${booking.bookingId}`;
    const upiLink = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

    res.json({ upiId: vpa, name, amount, upiLink, bookingId: booking.bookingId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/:id/upi-claim — customer marks that they've paid via UPI (pending admin verification)
exports.claimUpiPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    booking.paymentMethod = 'manual';
    if (req.body.upiRef) booking.paymentId = String(req.body.upiRef);
    await booking.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/:id/create-order
exports.createOrder = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });
    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Booking already paid' });

    const order = await razorpay.orders.create({
      amount: Math.round(booking.totalAmount * 100), // paise
      currency: 'INR',
      receipt: booking.bookingId,
      notes: { bookingId: booking._id.toString() },
    });

    booking.orderId = order.id;
    await booking.save();

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/:id/verify-payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.paymentId = razorpay_payment_id;
    booking.paidAt = Date.now();
    await booking.save();
    await booking.populate('trip', 'title coverImage destination days nights');

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/payment  (simulate payment confirmation)
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus = 'paid';
    booking.paymentId = paymentId || `pay_${Date.now()}`;
    booking.orderId = orderId;
    booking.bookingStatus = 'confirmed';
    booking.confirmedAt = Date.now();
    booking.paidAt = Date.now();
    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/status  [admin]
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { bookingStatus } = req.body;
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(bookingStatus)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const wasCancelled = booking.bookingStatus === 'cancelled';
    const wasConfirmed = booking.bookingStatus === 'confirmed';
    booking.bookingStatus = bookingStatus;
    if (bookingStatus === 'confirmed') booking.confirmedAt = Date.now();
    if (bookingStatus === 'cancelled') booking.cancelledAt = Date.now();
    await booking.save();
    if (bookingStatus === 'cancelled' && !wasCancelled) await releaseSeats(booking);
    await booking.populate([{ path: 'user', select: 'name email' }, { path: 'trip', select: 'title destination' }]);

    // Email the traveller their confirmation when a booking is newly confirmed.
    // Fire-and-forget so the admin's Confirm click responds instantly.
    let emailed = false;
    if (bookingStatus === 'confirmed' && !wasConfirmed) {
      emailed = mailer.isConfigured();
      mailer.sendBookingConfirmation(booking, booking.trip).catch(() => {});
    }

    res.json({ success: true, booking, emailed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/admin/all  [admin]
exports.getAllBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = status ? { bookingStatus: status } : {};
    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('trip', 'title destination')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ success: true, bookings, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
