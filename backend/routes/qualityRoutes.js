const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, uploadImage, getImage } = require('../controllers/qualityController');

router.post('/upload', protect, upload.single('foodImage'), uploadImage);
router.get('/image/:filename', getImage);

module.exports = router;
