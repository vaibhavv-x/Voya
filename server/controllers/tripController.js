const Trip = require('../models/Trip');

// GET /api/trips
exports.getTrips = async (req, res) => {
  try {
    const {
      page = 1, limit = 9,
      category, continent, country,
      minPrice, maxPrice,
      minDays, maxDays,
      difficulty, sort = 'createdAt',
      search, featured,
    } = req.query;

    const filter = { isActive: true };

    if (category)   filter.category   = category;
    if (continent)  filter.continent  = continent;
    if (country)    filter.country    = { $regex: country, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;
    if (featured)   filter.isFeatured = true;

    if (minPrice || maxPrice) {
      filter.pricePerPerson = {};
      if (minPrice) filter.pricePerPerson.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerPerson.$lte = Number(maxPrice);
    }

    if (minDays || maxDays) {
      filter.days = {};
      if (minDays) filter.days.$gte = Number(minDays);
      if (maxDays) filter.days.$lte = Number(maxDays);
    }

    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
        { country:     { $regex: search, $options: 'i' } },
        { tags:        { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortMap = {
      price_asc:  { pricePerPerson: 1,  _id: 1 },
      price_desc: { pricePerPerson: -1, _id: 1 },
      rating:     { rating: -1,         _id: 1 },
      newest:     { createdAt: -1,      _id: 1 },
      popular:    { reviewCount: -1,    _id: 1 },
    };

    // The trailing `_id` makes every ordering a stable total order — without it,
    // docs sharing a sort value (e.g. equal createdAt from a bulk seed) can
    // shuffle between queries and the same trip appears on two different pages.
    const skip = (Number(page) - 1) * Number(limit);
    const [trips, total] = await Promise.all([
      Trip.find(filter)
        .sort(sortMap[sort] || { isFeatured: -1, createdAt: -1, _id: 1 })
        .skip(skip)
        .limit(Number(limit))
        .select('-itinerary -faqs'),
      Trip.countDocuments(filter),
    ]);

    res.json({
      success: true,
      trips,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trips/:slug
exports.getTripBySlug = async (req, res) => {
  try {
    const trip = await Trip.findOne({ slug: req.params.slug, isActive: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trips/id/:id
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/trips/:slug/related
exports.getRelated = async (req, res) => {
  try {
    const trip = await Trip.findOne({ slug: req.params.slug });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    const related = await Trip.find({
      _id: { $ne: trip._id },
      isActive: true,
      $or: [{ category: trip.category }, { country: trip.country }],
    }).limit(3).select('-itinerary -faqs');
    res.json({ success: true, trips: related });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/trips  [admin]
exports.createTrip = async (req, res) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/trips/:id  [admin]
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/trips/:id  [admin]
exports.deleteTrip = async (req, res) => {
  try {
    await Trip.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Trip deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
