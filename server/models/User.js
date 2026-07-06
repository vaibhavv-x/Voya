const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  phone:    { type: String, default: '' },
  avatar:   { type: String, default: '' },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }],
  isVerified:       { type: Boolean, default: false },
  emailOtp:         { type: String, select: false },  // sha256 of the 6-digit code
  emailOtpExpires:  Date,
  resetToken:       String,
  resetTokenExpire: Date,
  // Referral program
  referralCode:     { type: String, unique: true, sparse: true },
  referredBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralRewarded: { type: Boolean, default: false }, // whether the referrer got paid for this user
  walletCredit:     { type: Number, default: 0 },       // ₹ credit usable at checkout
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function(entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
