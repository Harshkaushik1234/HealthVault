const MedicineInfo = require('../models/MedicineInfo');

// Sample default data to seed the database
const sampleMedicines = [
  {
    name: 'Paracetamol',
    use: 'Commonly used to relieve mild to moderate pain (such as headaches, muscle aches, toothaches) and reduce fever.',
    sideEffects: 'Generally safe at recommended doses. High doses can cause severe liver damage. Rare allergic reactions like skin rash.',
    precautions: 'Do not take with other products containing paracetamol. Avoid alcohol. Check liver health warnings.',
  },
  {
    name: 'Ibuprofen',
    use: 'Nonsteroidal anti-inflammatory drug (NSAID) used to reduce hormones that cause pain and inflammation in the body. Treats arthritis, menstrual cramps, back pain, and fever.',
    sideEffects: 'Stomach upset, mild heartburn, nausea, vomiting, bloating, gas, diarrhea, constipation, dizziness, headache, or ringing in the ears.',
    precautions: 'Can increase risk of fatal heart attack or stroke. Avoid if you have a history of stomach ulcers or kidney disease. Take with food.',
  },
  {
    name: 'Aspirin',
    use: 'Used to treat pain, fever, swelling, and inflammatory conditions. Also used at low doses as a blood thinner to prevent heart attacks and strokes.',
    sideEffects: 'Upset stomach, heartburn, easy bruising, bleeding. Serious side effects include blood in stool, severe stomach pain.',
    precautions: 'Do not give to children or teenagers with fever, flu, or chickenpox due to risk of Reye\'s syndrome. Avoid if you have bleeding disorders.',
  },
  {
    name: 'Amoxicillin',
    use: 'Penicillin-type antibiotic used to treat a wide variety of bacterial infections (tonsillitis, bronchitis, pneumonia, infections of ear, nose, throat, skin, or urinary tract).',
    sideEffects: 'Nausea, vomiting, diarrhea, stomach pain, vaginal itching or discharge, headache, swollen or black-looking tongue.',
    precautions: 'Finish full course prescribed even if symptoms disappear. Do not use if allergic to penicillin or cephalosporin antibiotics.',
  },
  {
    name: 'Metformin',
    use: 'First-line medication for the treatment of type 2 diabetes, particularly in people who are overweight. Helps control blood sugar levels.',
    sideEffects: 'Physical weakness (asthenia), diarrhea, gas, symptoms of low blood sugar, abdominal pain, lactic acidosis (rare but serious).',
    precautions: 'Monitor kidney function. Limit alcohol consumption to decrease lactic acidosis risk. Take with meals to reduce gastrointestinal side effects.',
  },
  {
    name: 'Atorvastatin (Lipitor)',
    use: 'Statin medication used to prevent cardiovascular disease in those at high risk and lower cholesterol levels.',
    sideEffects: 'Joint pain, diarrhea, muscle aches, nasal congestion, urinary tract infections.',
    precautions: 'Avoid eating grapefruit or drinking grapefruit juice. Inform doctor if you develop unexplained muscle pain or weakness.',
  },
];

// @desc    Search medicine by name
// @route   GET /api/medicines
// @access  Private (or Public)
const searchMedicine = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      // If no name is provided, return all or a small sample list
      const medicines = await MedicineInfo.find({}).limit(10);
      return res.json({ success: true, count: medicines.length, medicines });
    }

    // Perform case-insensitive regex search
    const medicines = await MedicineInfo.find({
      name: { $regex: name, $options: 'i' },
    });

    return res.json({
      success: true,
      count: medicines.length,
      medicines,
    });
  } catch (error) {
    console.error('Search medicine error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error, could not search medicine info' });
  }
};

// @desc    Seed default medicine database
// @route   POST /api/medicines/seed
// @access  Public
const seedMedicines = async (req, res) => {
  try {
    // Delete existing entries to prevent duplication
    await MedicineInfo.deleteMany({});
    
    // Seed new values
    const seeded = await MedicineInfo.insertMany(sampleMedicines);
    
    return res.status(201).json({
      success: true,
      message: 'Medicines seeded successfully!',
      count: seeded.length,
      seeded,
    });
  } catch (error) {
    console.error('Seed medicines error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error during seeding' });
  }
};

module.exports = {
  searchMedicine,
  seedMedicines,
  sampleMedicines, // Export for startup seeding
};
