const r = require('express').Router();
const multer = require('multer');
const c = require('../controllers/miscControllers');
const uploadController = require('../controllers/uploadController');
const { protect, adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

r.get('/stats', protect, adminOnly, c.getDashboardStats);
r.get('/users', protect, adminOnly, c.getAllUsers);
r.get('/leads', protect, adminOnly, c.getLeads);
r.put('/leads/:id', protect, adminOnly, c.updateLead);
r.post('/upload', protect, adminOnly, upload.single('image'), uploadController.uploadImage);
module.exports = r;
