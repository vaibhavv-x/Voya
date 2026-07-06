const mongoose = require('mongoose');

const itineraryDaySchema = new mongoose.Schema({
  day:           { type: Number, required: true },
  title:         { type: String, required: true },
  description:   { type: String, required: true },
  activities:    [String],
  meals:         { breakfast: Boolean, lunch: Boolean, dinner: Boolean },
  accommodation: String,
  image:         String,
}, { _id: false });

const tripSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  slug:        { type: String, unique: true },
  tagline:     { type: String, required: true },
  description: { type: String, required: true },
  destination: { type: String, required: true },
  country:     { type: String, required: true },
  continent:   { type: String, enum: ['Asia','Europe','Africa','Americas','Oceania','Antarctica'] },
  coverImage:  { type: String, required: true },
  images:      [String],
  pricePerPerson: { type: Number, required: true },
  originalPrice:  Number,
  currency:       { type: String, default: 'INR' },
  days:   { type: Number, required: true },
  nights: { type: Number, required: true },
  category:   { type: String, enum: ['Adventure','Beach','Cultural','Wildlife','Luxury','Spiritual','Honeymoon','Backpacking','Family','Solo'], required: true },
  difficulty: { type: String, enum: ['Easy','Moderate','Challenging','Expert'], default: 'Moderate' },
  tags:         [String],
  maxGroupSize: { type: Number, default: 14 },
  minGroupSize: { type: Number, default: 2 },
  departureFrom: String,
  itinerary:    [itineraryDaySchema],
  included:     [String],
  excluded:     [String],
  highlights:   [String],
  bestTimeToVisit: String,
  climate:         String,
  language:        String,
  currency_local:  String,
  visaRequired:    { type: Boolean, default: false },
  visaInfo:        String,
  accommodationKind:    String,
  accommodationName:    String,
  accommodationDetails: String,
  transportTo:    String,
  transportLocal: String,
  location: { lat: Number, lng: Number },
  departures: [{
    date:        { type: Date, required: true },
    seatsTotal:  { type: Number, required: true, min: 1, default: 14 },
    seatsBooked: { type: Number, default: 0, min: 0 },
  }],
  faqs: [{ question: String, answer: String }],
  rating:      { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isFeatured:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  soldOut:     { type: Boolean, default: false },
}, { timestamps: true });

tripSchema.pre('save', function() {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
});

module.exports = mongoose.model('Trip', tripSchema);
