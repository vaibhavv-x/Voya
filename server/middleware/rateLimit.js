const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

const hits = new Map();

exports.simpleRateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    hits.set(ip, { windowStart: now, count: 1 });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return res.status(429).json({ message: 'Too many requests. Please slow down.' });
  }

  entry.count += 1;
  next();
};
