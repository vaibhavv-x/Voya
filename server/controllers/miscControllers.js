const User = require('../models/User');
const Newsletter = require('../models/Newsletter');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Lead = require('../models/Lead');
const mailer = require('../utils/mailer');

// ── WISHLIST ──
exports.toggleWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tripId = req.params.tripId;
    const idx = user.wishlist.indexOf(tripId);
    if (idx === -1) user.wishlist.push(tripId);
    else user.wishlist.splice(idx, 1);
    await user.save();
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('wishlist', 'title slug coverImage destination pricePerPerson days nights rating category');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── CONTACT ──
exports.sendContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, tripTypes } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const lead = await Lead.create({ name, email, phone, subject, message, tripTypes });

    mailer.sendEnquiryAck(lead).catch(() => {});
    mailer.sendAdminAlert(`New enquiry from ${name}`,
      `<p style="font-size:14px">${name} (${email}${phone ? `, ${phone}` : ''})${subject ? ` — <strong>${subject}</strong>` : ''}</p>${message ? `<p style="font-size:13px;color:#6F6F6F">${message}</p>` : ''}`).catch(() => {});

    res.json({ success: true, message: 'Your message has been received. We\'ll reply within 24 hours.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/leads  [admin]
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({ success: true, leads });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/leads/:id  [admin]
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── NEWSLETTER ──
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (!existing.isActive) { existing.isActive = true; await existing.save(); }
      return res.json({ success: true, message: 'You\'re already subscribed!' });
    }
    await Newsletter.create({ email });
    res.status(201).json({ success: true, message: 'Subscribed! Welcome to Voya°.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── ADMIN ──
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalTrips, totalBookings, totalUsers, totalRevenue, recentBookings] = await Promise.all([
      Trip.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.find().populate('user', 'name email').populate('trip', 'title').sort({ createdAt: -1 }).limit(5),
    ]);
    res.json({
      success: true,
      stats: {
        totalTrips,
        totalBookings,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentBookings,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
