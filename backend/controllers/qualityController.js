const multer = require('multer');
const path = require('path');

// @desc    Upload food image
// @route   POST /api/quality/upload
// @access  Private
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'food-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif) are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// @desc    Handle image upload
const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  const imageUrl = `/api/quality/image/${req.file.filename}`;
  res.json({
    message: 'Image uploaded successfully',
    imageUrl,
    filename: req.file.filename,
  });
};

// @desc    Serve uploaded image
const getImage = (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, '../uploads', filename);
  res.sendFile(filepath);
};

module.exports = { upload, uploadImage, getImage };
