require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo-user-db:27017/user_db';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
