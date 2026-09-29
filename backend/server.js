require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const MedicineInfo = require('./models/MedicineInfo');
const { sampleMedicines } = require('./controllers/medicineController');

// Initialize Express App
const app = express();

// Connect to Database
connectDB().then(() => {
  // Auto-seed medicines if database is empty on start
  autoSeedMedicines();
});

// Auto-seed function
async function autoSeedMedicines() {
  try {
    const count = await MedicineInfo.countDocuments();
    if (count === 0) {
      console.log('No medicines found in database. Seeding initial medicine information library...');
      await MedicineInfo.insertMany(sampleMedicines);
      console.log('\x1b[32m%s\x1b[0m', '✅ Auto-seeded common medicine information successfully.');
    }
  } catch (error) {
    console.error('Failed to auto-seed medicines:', error.message);
  }
}

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] 🌐 ${req.method} ${req.originalUrl}`);
  next();
});

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the HealthVault API Server!' });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/share', require('./routes/share'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API Endpoint not found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 HealthVault Server running in production/development mode on port ${PORT}`);
});
