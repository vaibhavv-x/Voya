const { uploadBuffer } = require('../utils/cloudinary');

// POST /api/admin/upload  [admin]
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const result = await uploadBuffer(req.file.buffer);
    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
