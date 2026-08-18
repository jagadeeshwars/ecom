require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'product-service' });
});

const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo-product-db:27017/product_db';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
app.listen(PORT, () => {
  console.log(`Product Service running on port ${PORT}`);
});
