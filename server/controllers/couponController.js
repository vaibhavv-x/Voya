const Coupon = require('../models/Coupon');

function isValidCoupon(coupon) {
  return coupon && coupon.active && coupon.expiresAt > new Date();
}

// GET /api/coupons/validate/:code
exports.validateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code.toUpperCase() });
    if (!isValidCoupon(coupon)) {
      return res.status(404).json({ valid: false, message: 'Invalid or expired coupon code' });
    }
    res.json({ valid: true, code: coupon.code, percentOff: coupon.percentOff, flatOff: coupon.flatOff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/coupons  [admin]
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/coupons  [admin]
exports.createCoupon = async (req, res) => {
  try {
    const { code, percentOff, flatOff, expiresAt } = req.body;
    if (!percentOff && !flatOff) return res.status(400).json({ message: 'Provide a percent or flat discount' });
    const coupon = await Coupon.create({
      code,
      percentOff: Number(percentOff) || 0,
      flatOff: Number(flatOff) || 0,
      expiresAt,
    });
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/coupons/:id  [admin]
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.isValidCoupon = isValidCoupon;
