require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5004;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo-order-db:27017/order_db';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
