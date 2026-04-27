const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Cron Jobs
const { initCronJobs } = require('./utils/cronJobs');
initCronJobs();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/geo', require('./routes/geoRoutes'));
app.use('/api/expiry', require('./routes/expiryRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/quality', require('./routes/qualityRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/receipts', require('./routes/receiptRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FDM API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
