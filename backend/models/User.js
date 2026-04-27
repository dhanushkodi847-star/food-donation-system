const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [
        function() { return !this.googleId; },
        'Password is required'
      ],
      minlength: 6,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    phone: {
      type: String,
      required: [
        function() { return !this.googleId; },
        'Phone number is required'
      ],
      trim: true,
    },
    address: {
      type: String,
      required: [
        function() { return !this.googleId; },
        'Address is required'
      ],
      trim: true,
    },
    role: {
      type: String,
      enum: ['donor', 'receiver', 'admin'],
      required: true,
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
