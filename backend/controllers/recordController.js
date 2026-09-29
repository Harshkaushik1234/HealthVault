const MedicalRecord = require('../models/MedicalRecord');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Helper to stream upload from memory buffer to Cloudinary
const uploadFromBuffer = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    // Generate a unique folder-based filename without extensions
    const cleanName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const sanitizedName = cleanName.replace(/[^a-zA-Z0-9]/g, '_');
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'healthvault_records',
        public_id: `${sanitizedName}_${Date.now()}`,
        resource_type: 'auto', // Cloudinary auto-detects images, pdfs, audio, etc.
      },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Upload a new medical record
// @route   POST /api/records
// @access  Private
const uploadRecord = async (req, res) => {
  try {
    const { category, date } = req.body;

    if (!isCloudinaryConfigured) {
      return res.status(400).json({
        success: false,
        message: 'Cloudinary is not configured. Please supply CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in the environment configurations.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    if (!category || !date) {
      return res.status(400).json({ success: false, message: 'Please specify record category and date' });
    }

    // Stream upload to Cloudinary
    console.log(`Starting upload to Cloudinary for file: ${req.file.originalname}`);
    const uploadResult = await uploadFromBuffer(req.file.buffer, req.file.originalname);
    console.log('Cloudinary upload success:', uploadResult.secure_url);

    // Save metadata to MongoDB
    const record = await MedicalRecord.create({
      userId: req.user.id,
      fileName: req.file.originalname,
      filePath: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      category,
      date: new Date(date),
    });

    return res.status(201).json({
      success: true,
      message: 'Medical record uploaded successfully',
      record,
    });
  } catch (error) {
    console.error('File upload controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Upload failed. ' + (error.message || 'Internal Server Error'),
    });
  }
};

// @desc    Get all medical records for logged-in user (with search filtering)
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res) => {
  try {
    const { search } = req.query;
    let query = { userId: req.user.id };

    // If search term is present, perform case-insensitive regex search on filename or category
    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort by record date descending
    const records = await MedicalRecord.find(query).sort({ date: -1 });

    return res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error('Get records controller error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error retrieving records' });
  }
};

// @desc    Delete a medical record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Check ownership
    if (record.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this record' });
    }

    // Delete resource from Cloudinary first
    if (isCloudinaryConfigured && record.cloudinaryId) {
      try {
        const fileExt = record.fileName.split('.').pop().toLowerCase();
        // Cloudinary requires 'raw' type for pdfs/docs to delete properly
        const isRaw = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'].includes(fileExt);
        const resourceType = isRaw ? 'raw' : 'image';

        console.log(`Deleting from Cloudinary: ${record.cloudinaryId} (${resourceType})`);
        await cloudinary.uploader.destroy(record.cloudinaryId, { resource_type: resourceType });
      } catch (cloudinaryErr) {
        console.error('Failed to delete from Cloudinary:', cloudinaryErr.message);
        // Continue and delete from db anyway to avoid orphaned DB records
      }
    }

    // Remove from MongoDB
    await record.deleteOne();

    return res.json({
      success: true,
      message: 'Medical record deleted successfully',
    });
  } catch (error) {
    console.error('Delete record controller error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error deleting record' });
  }
};

module.exports = {
  uploadRecord,
  getRecords,
  deleteRecord,
};
