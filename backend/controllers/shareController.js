const SharedRecord = require('../models/SharedRecord');
const crypto = require('crypto');

// @desc    Generate a secure sharing link for selected records
// @route   POST /api/share
// @access  Private
const generateShareLink = async (req, res) => {
  try {
    const { recordIds } = req.body;

    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one medical record to share',
      });
    }

    // Generate a secure, unique cryptographic hex token
    const token = crypto.randomBytes(16).toString('hex');

    const sharedRecord = await SharedRecord.create({
      token,
      userId: req.user.id,
      records: recordIds,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    return res.status(201).json({
      success: true,
      message: 'Share link generated successfully',
      token,
      shareUrl: `${frontendUrl}/share/${token}`,
      sharedRecord,
    });
  } catch (error) {
    console.error('Generate share link error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error, could not generate share link' });
  }
};

// @desc    Get shared records by secure token
// @route   GET /api/share/:token
// @access  Public (Doctors do not need authentication to view shared items)
const getSharedRecords = async (req, res) => {
  try {
    const { token } = req.params;

    // Find shared record token and populate related records and user details
    const sharedRecord = await SharedRecord.findOne({ token })
      .populate({
        path: 'records',
        select: 'fileName filePath category date',
      })
      .populate({
        path: 'userId',
        select: 'name email',
      });

    if (!sharedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Shared link is invalid or has expired',
      });
    }

    return res.json({
      success: true,
      patientName: sharedRecord.userId.name,
      patientEmail: sharedRecord.userId.email,
      sharedAt: sharedRecord.createdAt,
      records: sharedRecord.records,
    });
  } catch (error) {
    console.error('Retrieve shared records error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error, could not load shared records' });
  }
};

module.exports = {
  generateShareLink,
  getSharedRecords,
};
