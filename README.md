# HealthVault 🛡️

HealthVault is a state-of-the-art MERN (MongoDB, Express, React, Node.js) stack healthcare management web application designed with a sleek, responsive **Black & Green** theme. It provides patients with a highly secure and visually stunning portal to organize medical documents, track medicine reminders, research drug details, and share specific clinical charts with doctors.

## Key Features

1. **🔒 Secure JWT Authentication**
   - User registration and login gates.
   - Dynamic route protection on both client side (React Router Guards) and server side (Express Auth middlewares).
   - High-entropy password hashing using `bcryptjs` (10 rounds).

2. **📊 Analytical Health Dashboard**
   - Welcomes users by name with a responsive greeting.
   - Displays real-time aggregate statistics for uploaded records and active reminders.
   - Shows recent uploads with single-click preview shortcuts.

3. **☁️ Direct Cloudinary Medical Records Vault**
   - In-memory multi-part uploading utilizing `Multer` buffers (`memoryStorage`).
   - Zero local disk footprint: files are streamed **directly** to Cloudinary using their streaming API.
   - Stores filename, Cloudinary secure URL, category, record date, and user references in MongoDB.
   - Integrated with case-insensitive real-time search queries and deletes resources from both MongoDB and Cloudinary.

4. **⏰ Daily Medicine Reminders**
   - Create medicine alarm schedules detailing drug name, dosage (e.g. "1 tablet"), time (e.g. "08:30 AM"), and special notes (e.g. "after lunch").
   - Display schedules on glowing daily indicator boards.
   - Easy single-click removal/deletion.

5. **🔬 Smart Medicine Information Lookup**
   - Queries a robust MongoDB drug database with case-insensitive partial searches.
   - Auto-seeding feature: populated with standard medicines (Paracetamol, Ibuprofen, Aspirin, Amoxicillin, Metformin, Lipitor) on server startup if the collection is empty.
   - Visually renders details: Uses, Side-Effects, and safety Precautions.

6. **🔗 Secure Doctor Sharing Portal**
   - Allows patients to selectively check documents and generate secure clinical sharing URLs.
   - Generates high-entropy cryptographic hex tokens mapping exclusively to selected records.
   - Public doctor report viewer (`/share/:token`) requires **no registration/authentication** for doctors, providing frictionless and secure review of selected charts.

---

## Folder Structure

```text
healthVault_new/
├── backend/
│   ├── config/
│   │   ├── db.js             # MongoDB Mongoose connection
│   │   └── cloudinary.js     # Cloudinary API Configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── recordController.js
│   │   ├── reminderController.js
│   │   ├── medicineController.js
│   │   └── shareController.js
│   ├── middleware/
│   │   ├── authMiddleware.js # JWT payload validator
│   │   └── uploadMiddleware.js # Multer buffer handler
│   ├── models/
│   │   ├── User.js
│   │   ├── MedicalRecord.js
│   │   ├── Reminder.js
│   │   ├── MedicineInfo.js
│   │   └── SharedRecord.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── records.js
│   │   ├── reminders.js
│   │   ├── medicines.js
│   │   └── share.js
│   ├── .env                  # Port, MongoDB connection, Cloudinary keys
│   ├── .env.example
│   ├── server.js             # Node main execution gateway
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx    # Styled top navigation bar
│   │   │   └── ProtectedRoute.jsx # Route session validator
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MedicalRecords.jsx
│   │   │   ├── MedicineInfo.jsx
│   │   │   ├── MedicineReminder.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ShareRecords.jsx  # Handles both patient sharing and doctor reporting
│   │   ├── App.jsx           # Main client-side router
│   │   ├── App.css           # Grid layouts, responsive utilities, and badges
│   │   ├── index.css         # Visual design tokens, custom font, and colors
│   │   └── main.jsx
│   ├── .env                  # Backend API URL config
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Instructions to Run Frontend and Backend

Follow these steps to run both parts of the application locally:

### Prerequisites
*   [Node.js](https://nodejs.org/) installed (v16.0.0 or higher recommended).
*   [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port `27017` (default), or a remote MongoDB Atlas connection string.

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. The dependencies are already configured in `package.json`. If you need to install them again, run:
   ```bash
   npm install
   ```

3. Create your `.env` configuration file. We have created a default `.env` and `.env.example` in the directory. Open `.env` and configure your keys:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/healthvault
   JWT_SECRET=supersecure_healthvault_jwt_secret_key_2026
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:5173
   ```
   *Note: If Cloudinary keys are left as placeholders, the server will start up normally but medical record file uploads will return an alert error requesting configuration.*

4. Launch the Express server in development hot-reload mode:
   ```bash
   npm run dev
   ```
   *The console will log:*
   ```text
   🚀 HealthVault Server running on port 5000
   MongoDB Connected: 127.0.0.1
   ✅ Auto-seeded common medicine information successfully.
   ```

---

### Step 2: Frontend Setup

1. Open a new terminal and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. We have pre-configured `frontend/.env` to point to the backend URL on port `5000`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Launch the Vite client application dev server:
   ```bash
   npm run dev
   ```
   *The console will print:*
   ```text
     VITE v8.x.x  ready in 123 ms

     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
   ```

5. Open your web browser and navigate to **`http://localhost:5173/`** to experience **HealthVault**!

---

## Verification and Testing Flow

To confirm that the implementation is 100% operational:
1. **User Onboarding**: Navigate to the Register page, sign up with a new email, and verify that you are automatically logged in and redirected to the Dashboard.
2. **Interactive Reminders**: Go to the Reminders tab, create a schedule for "Paracetamol" with a dosage of "2 Tablets" at "09:00 AM". Ensure it renders instantly as a neon-glow card, then click delete and confirm it removes successfully.
3. **Medical Records Upload**: Input your Cloudinary credentials in `backend/.env`. Upload an image or PDF file on the Medical Records page, selecting a category and record date. Verify that it uploads directly to Cloudinary, displays in your document vault list, and opens in a new tab upon clicking "View Document".
4. **Clinical Lookup**: Navigate to the Medicine Info page. In the search box, search for "Ibuprofen" or "Amoxicillin" and press enter. Confirm that uses, side-effects, and precautions appear cleanly.
5. **Doctor Sharing**: Go to the Share Link tab. Tick the checkbox on one or two files and click "Generate Sharing Link". Copy the generated link and paste it into an incognito window. Ensure that it opens a dedicated clinical review page displaying **only** those shared files, populating the patient's name, without requesting any login or credentials!
