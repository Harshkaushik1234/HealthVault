const multer = require('multer');

// Memory storage keeps file buffers in RAM, allowing us to upload directly to Cloudinary
const storage = multer.memoryStorage();

// File filter to support common medical record formats (images, PDFs, and Word documents)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed formats: PDF, Word (DOC/DOCX), JPG, JPEG, and PNG.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file limit
  },
  fileFilter,
});

module.exports = upload;
