const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

dotenv.config();
const app = express();

// 1. Enhanced CORS Config
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initial Admin Creation Function
const seedInitialAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await User.create({
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
      });
      console.log('✅ Initial Admin Account Created Automatically.');
    }
  } catch (err) {
    console.error('Error seeding admin:', err.message);
  }
};

// 2. Serverless Friendly MongoDB Middleware
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB Connected');
    await seedInitialAdmin();
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
  }
};

// Har incoming request se pehle DB connection verify/connect karein
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// 3. Test Routes (Root & /api)
app.get('/', (req, res) => {
  res.status(200).send('Smart Complaint System API is running live on Vercel!');
});

app.get('/api', (req, res) => {
  res.status(200).json({ status: 'Success', message: 'Smart Complaint System API (/api) is Live!' });
});

// 4. API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/complaints', complaintRoutes);

// Local Development
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Vercel Serverless Export
module.exports = app;