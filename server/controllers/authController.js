const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../utils/mailer');

const OTP_TTL = 10 * 60 * 1000; // 10 minutes
const genOtp  = () => String(crypto.randomInt(100000, 1000000)); // 6 digits
const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

// Generate a fresh code, store its hash on the user, and email it.
// Returns { devOtp } only when email isn't configured yet, so the flow still works.
async function issueOtp(user) {
  const otp = genOtp();
  user.emailOtp = hashOtp(otp);
  user.emailOtpExpires = Date.now() + OTP_TTL;
  await user.save({ validateBeforeSave: false });

  // Try to email the code, but never let a slow/blocked SMTP hang the request.
  // If it doesn't send within the window, hand the code back so signup still completes.
  const sent = await Promise.race([
    mailer.sendOtp(user, otp).then((r) => !!(r && r.sent)).catch(() => false),
    new Promise((res) => setTimeout(() => res(false), 8500)),
  ]);
  return sent ? {} : { devOtp: otp };
}

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'voya_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, user });
};

const REFERRAL_BONUS = 1000; // ₹ credit for referrer and referee

function makeReferralCode(name) {
  const base = (name || 'VOYA').replace(/[^a-zA-Z]/g, '').slice(0, 6).toUpperCase() || 'VOYA';
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${base}-${rand}`;
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, ref } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Resolve referrer (if a valid referral code was used)
    let referrer = null;
    if (ref) referrer = await User.findOne({ referralCode: ref.toUpperCase() });

    // Basic format guard (defence in depth — the client validates too)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ''))
      return res.status(400).json({ message: 'Please enter a valid email address' });

    const user = await User.create({
      name, email, password, phone,
      referralCode: makeReferralCode(name),
      referredBy: referrer ? referrer._id : undefined,
      walletCredit: referrer ? REFERRAL_BONUS : 0, // welcome bonus for joining via referral
      isVerified: false,
    });

    // Don't log them in yet — email must be verified via OTP first.
    const extra = await issueOtp(user);
    res.status(201).json({ success: true, needsVerification: true, email: user.email, ...extra });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/verify-otp  — confirm the emailed code, then log the user in
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+emailOtp');
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.isVerified) return sendToken(user, 200, res);
    if (!user.emailOtp || !user.emailOtpExpires || user.emailOtpExpires < Date.now())
      return res.status(400).json({ message: 'Your code has expired — request a new one.' });
    if (user.emailOtp !== hashOtp(otp || ''))
      return res.status(400).json({ message: 'Incorrect code. Please check and try again.' });

    user.isVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });
    const extra = await issueOtp(user);
    res.json({ success: true, email: user.email, ...extra });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/referral  — referral code, link data, wallet, count of referrals
exports.getReferral = async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    // Back-fill a code for older accounts that predate the referral feature
    if (!user.referralCode) {
      user.referralCode = makeReferralCode(user.name);
      await user.save();
    }
    const referredCount = await User.countDocuments({ referredBy: user._id });
    res.json({
      success: true,
      referralCode: user.referralCode,
      walletCredit: user.walletCredit || 0,
      referredCount,
      bonus: REFERRAL_BONUS,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    // Unverified account (e.g. registered but never entered the code) — send a fresh code
    if (!user.isVerified) {
      const extra = await issueOtp(user);
      return res.status(403).json({ needsVerification: true, email: user.email, message: 'Please verify your email to continue.', ...extra });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'title coverImage slug pricePerPerson destination');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword)))
      return res.status(401).json({ message: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'No user with that email' });
    const token = crypto.randomBytes(20).toString('hex');
    user.resetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: 'Reset token generated', token }); // In prod: email it
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ resetToken: hashed, resetTokenExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = req.body.password;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
