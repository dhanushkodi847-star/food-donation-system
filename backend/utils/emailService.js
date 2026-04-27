const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // App Password for Gmail
  },
});

const sendOTP = async (email, otp) => {
  // MOCK MODE: Log to console if placeholder credentials are used
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com' || 
      !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-gmail-app-password') {
    console.log('-----------------------------------------');
    console.log(`[MOCK EMAIL] To: ${email}`);
    console.log(`[MOCK EMAIL] OTP: ${otp}`);
    console.log('-----------------------------------------');
    return true; 
  }

  const mailOptions = {
    from: `"FoodShare" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verification Code for FoodShare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #10b981; text-align: center;">Welcome to FoodShare!</h2>
        <p>Thank you for joining our community. To complete your registration, please use the following 6-digit verification code:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 25px 0;">
          <h1 style="margin: 0; letter-spacing: 5px; color: #1f2937;">${otp}</h1>
        </div>
        <p>This code is valid for 5 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">
          &copy; 2026 FoodShare. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

module.exports = { sendOTP };
