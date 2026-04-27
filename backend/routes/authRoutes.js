const express = require('express');
const { body } = require('express-validator');
const {
  registerDonor,
  registerReceiver,
  login,
  getProfile,
  updateProfile,
  googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');


const router = express.Router();

// Validation rules
const registerValidation = [
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Please include a valid email').isEmail().normalizeEmail(),
  body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  body('phone', 'Phone number is required').notEmpty().trim(),
  body('address', 'Address is required').notEmpty().trim(),
];

// Routes
router.post('/register/donor', registerValidation, registerDonor);
router.post(
  '/register/receiver',
  registerValidation.concat([
    body('organization', 'Organization name is required for receivers').notEmpty().trim(),
  ]),
  registerReceiver
);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

module.exports = router;
