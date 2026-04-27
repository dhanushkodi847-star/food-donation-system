const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const UserSchema = new mongoose.Schema({}, { strict: false });
const DonationSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', UserSchema, 'users');
const Donation = mongoose.model('Donation', DonationSchema, 'donations');

async function checkCounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const userCount = await User.countDocuments();
    const donorCount = await User.countDocuments({ role: 'donor' });
    const donationCount = await Donation.countDocuments();
    const statusCounts = await Donation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('--- Results ---');
    console.log('Total Users:', userCount);
    console.log('Donors:', donorCount);
    console.log('Total Donations:', donationCount);
    console.log('Status Breakdown:', JSON.stringify(statusCounts, null, 2));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkCounts();
