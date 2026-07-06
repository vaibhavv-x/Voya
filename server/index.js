const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/trips',        require('./routes/trips'));
app.use('/api/bookings',     require('./routes/bookings'));
app.use('/api/reviews',      require('./routes/reviews'));
app.use('/api/wishlist',     require('./routes/wishlist'));
app.use('/api/contact',      require('./routes/contact'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/newsletter',   require('./routes/newsletter'));
app.use('/api/assistant',    require('./routes/assistant'));
app.use('/api/coupons',      require('./routes/coupons'));

app.get('/api/seed', require('./utils/seeder'));

app.get('/', (req, res) => res.json({ status: 'Voya API running' }));
app.get('/api/health', (req, res) => res.json({ status: 'Voya API running' }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
    });
  })
  .catch((err) => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });
