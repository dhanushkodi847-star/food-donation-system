const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@fdm.com',
      password: 'admin123',
      phone: '9999999999',
      address: 'FDM Headquarters',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@fdm.com');
    console.log('   Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
