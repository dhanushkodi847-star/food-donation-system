const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const Donation = require('../models/Donation');
const User = require('../models/User');
const ReceiptRequest = require('../models/ReceiptRequest');

// @desc    Request a receipt download
// @route   POST /api/receipts/request
// @access  Private
const requestReceipt = async (req, res) => {
  try {
    const { donationId, type } = req.body;

    // Check if request already exists and is pending
    const existing = await ReceiptRequest.findOne({
      user: req.user._id,
      donation: donationId || null,
      type: type || 'single',
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already pending' });
    }

    const request = await ReceiptRequest.create({
      user: req.user._id,
      donation: donationId,
      type: type || 'single',
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all receipt requests (Admin)
// @route   GET /api/receipts/requests
// @access  Private (Admin)
const getReceiptRequests = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const requests = await ReceiptRequest.find({ status })
      .populate('user', 'name email role')
      .populate('donation', 'foodName status quantity unit')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user's own receipt requests
// @route   GET /api/receipts/my-requests
// @access  Private
const getMyReceiptRequests = async (req, res) => {
  try {
    const requests = await ReceiptRequest.find({ user: req.user._id })
      .populate('donation', 'foodName status')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update receipt request status (Admin)
// @route   PUT /api/receipts/requests/:id
// @access  Private (Admin)
const updateReceiptRequest = async (req, res) => {
  try {
    const { status, adminMessage } = req.body;
    const request = await ReceiptRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    request.adminMessage = adminMessage;
    request.resolvedAt = Date.now();

    await request.save();
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Download single donation receipt
// @route   GET /api/receipts/download/:donationId
// @access  Private
const downloadReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId)
      .populate('donor', 'name email phone address')
      .populate('receiver', 'name email phone organization address');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin') {
      // Must be donor or receiver
      const isPart = donation.donor._id.toString() === req.user._id.toString() || 
                     (donation.receiver && donation.receiver._id.toString() === req.user._id.toString());
      
      if (!isPart) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Must be approved
      const approval = await ReceiptRequest.findOne({
        user: req.user._id,
        donation: donation._id,
        status: 'approved'
      });

      if (!approval) {
        return res.status(403).json({ message: 'Receipt download requires admin approval' });
      }
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt_${donation._id}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(25).text('FoodShare - Donation Receipt', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Receipt ID: ${donation._id}`, { align: 'right' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Line
    doc.moveTo(50, 140).lineTo(550, 140).stroke();
    doc.moveDown(2);

    // Food Info
    doc.fontSize(16).text('Donation Details', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Food Name: ${donation.foodName}`);
    doc.text(`Category: ${donation.category}`);
    doc.text(`Quantity: ${donation.quantity} ${donation.unit}`);
    doc.text(`Status: ${donation.status.toUpperCase()}`);
    doc.moveDown();

    // Donor & Receiver Info
    doc.fontSize(16).text('Participants', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica-Bold').text('Donor Details:');
    doc.fontSize(10).font('Helvetica')
      .text(`Name: ${donation.donor.name}`)
      .text(`Email: ${donation.donor.email}`)
      .text(`Phone: ${donation.donor.phone}`)
      .text(`Profile Address: ${donation.donor.address || 'N/A'}`)
      .text(`Pickup Address: ${donation.pickupAddress}`);
    
    doc.moveDown();

    if (donation.receiver) {
      doc.fontSize(12).font('Helvetica-Bold').text('Receiver Details:');
      doc.fontSize(10).font('Helvetica')
        .text(`Name: ${donation.receiver.name} ${donation.receiver.organization ? `(${donation.receiver.organization})` : ''}`)
        .text(`Email: ${donation.receiver.email}`)
        .text(`Phone: ${donation.receiver.phone}`)
        .text(`Address: ${donation.receiver.address || 'N/A'}`);
    } else {
      doc.fontSize(12).font('Helvetica-Bold').text('Receiver:');
      doc.fontSize(10).font('Helvetica').text('Not assigned yet.');
    }
    doc.moveDown();

    // Food Image (if exists)
    if (donation.foodImage) {
      const imagePath = path.join(__dirname, '..', donation.foodImage);
      if (fs.existsSync(imagePath)) {
        try {
          doc.addPage();
          doc.fontSize(16).text('Food Evidence', { underline: true });
          doc.moveDown();
          doc.image(imagePath, {
            fit: [500, 400],
            align: 'center',
            valign: 'center'
          });
        } catch (imgErr) {
          console.error('Error adding image to PDF:', imgErr);
        }
      }
    }

    // Footer
    doc.moveTo(50, 700).lineTo(550, 700).stroke();
    doc.fontSize(10).text('Thank you for being part of FoodShare and reducing food waste!', 50, 720, { align: 'center' });

    doc.end();

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Admin: Export full donation report
// @route   GET /api/receipts/export/all
// @access  Private (Admin)
const exportAllDonations = async (req, res) => {
  try {
    const donations = await Donation.find({})
      .populate('donor', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=all_donations_report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('FoodShare - Full Donation Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 100;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('ID', 50, tableTop);
    doc.text('Food Name', 150, tableTop);
    doc.text('Quantity', 300, tableTop);
    doc.text('Status', 400, tableTop);
    doc.text('Date', 500, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.font('Helvetica');

    let y = tableTop + 30;
    donations.forEach(d => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.text(d._id.toString().substring(0, 8), 50, y);
      doc.text(d.foodName, 150, y, { width: 140 });
      doc.text(`${d.quantity} ${d.unit}`, 300, y);
      doc.text(d.status, 400, y);
      doc.text(new Date(d.createdAt).toLocaleDateString(), 500, y);
      y += 25;
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Download all user's donation receipts (requires approval)
// @route   GET /api/receipts/download-all
// @access  Private
const downloadUserReport = async (req, res) => {
  try {
    // Check for bulk approval
    const approval = await ReceiptRequest.findOne({
      user: req.user._id,
      type: 'all',
      status: 'approved'
    });

    if (!approval && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bulk receipt download requires admin approval' });
    }

    let donations;
    if (req.user.role === 'donor') {
      donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
    } else if (req.user.role === 'receiver') {
      donations = await Donation.find({ receiver: req.user._id }).sort({ createdAt: -1 });
    } else {
      donations = await Donation.find({}).sort({ createdAt: -1 });
    }

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${req.user.role}_report.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text(`FoodShare - ${req.user.role.toUpperCase()} Report`, { align: 'center' });
    doc.fontSize(12).text(`User: ${req.user.name}`, { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Line
    doc.moveTo(30, 90).lineTo(570, 90).stroke();
    doc.moveDown();

    let y = 110;
    donations.forEach((d, index) => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${d.foodName}`, 50, y);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Status: ${d.status}`, 50, y + 15);
      doc.text(`Quantity: ${d.quantity} ${d.unit}`, 200, y + 15);
      doc.text(`Date: ${new Date(d.createdAt).toLocaleDateString()}`, 350, y + 15);
      
      y += 45;
      doc.moveTo(50, y - 5).lineTo(550, y - 5).strokeColor('#eeeeee').stroke();
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  requestReceipt,
  getReceiptRequests,
  updateReceiptRequest,
  downloadReceipt,
  exportAllDonations,
  getMyReceiptRequests,
  downloadUserReport
};
