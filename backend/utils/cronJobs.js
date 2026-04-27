const cron = require('node-cron');
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');

const initCronJobs = () => {
  // Run every minute to check for expired and expiring donations
  cron.schedule('* * * * *', async () => {
    console.log('⏰ Running automated food expiry job...');
    try {
      const now = new Date();

      // 1. Process Expired Food (Status: available/requested -> expired)
      const expiredDonations = await Donation.find({
        status: { $in: ['available', 'requested'] },
        expiryDate: { $lte: now }
      });

      if (expiredDonations.length > 0) {
        console.log(`Found ${expiredDonations.length} expired donations to update.`);
        for (const donation of expiredDonations) {
          donation.status = 'expired';
          await donation.save();

          // Notify Donor that their food has expired
          await Notification.create({
            user: donation.donor,
            title: 'Donation Expired',
            message: `Your donation "${donation.foodName}" has expired and is no longer available for collection.`,
            type: 'error',
            relatedDonation: donation._id,
          });
        }
      }

      // 2. Pre-expiry Notifications (30 minutes before)
      const thirtyMinsFromNow = new Date(now.getTime() + 30 * 60 * 1000);
      
      const expiringSoon = await Donation.find({
        status: 'available',
        expiryDate: { $lte: thirtyMinsFromNow, $gt: now },
        expiryNotified: false
      });

      if (expiringSoon.length > 0) {
        console.log(`Found ${expiringSoon.length} donations expiring in 30 minutes.`);
        for (const donation of expiringSoon) {
          await Notification.create({
            user: donation.donor,
            title: 'Expiry Warning (30m)',
            message: `URGENT: Your donation "${donation.foodName}" expires in less than 30 minutes (${new Date(
              donation.expiryDate
            ).toLocaleTimeString()}).`,
            type: 'warning',
            relatedDonation: donation._id,
          });

          donation.expiryNotified = true;
          await donation.save();
        }
      }
    } catch (error) {
      console.error('Error in expiry cron job:', error.message);
    }
  });

  console.log('⏱️  Cron jobs initialized (1-minute intervals)');
};

module.exports = { initCronJobs };
