const express = require('express');
const router = express.Router();
const {
  searchMedicine,
  seedMedicines,
} = require('../controllers/medicineController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, searchMedicine);
router.post('/seed', seedMedicines);

module.exports = router;
