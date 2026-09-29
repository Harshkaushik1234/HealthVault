const express = require('express');
const router = express.Router();
const {
  generateShareLink,
  getSharedRecords,
} = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');

// Route to generate a new sharing link (protected - only patients can share their records)
router.post('/', protect, generateShareLink);

// Route for doctors to fetch the shared records using token (public - no login required)
router.get('/:token', getSharedRecords);

module.exports = router;
