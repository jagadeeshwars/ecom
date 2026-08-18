const express = require('express');
const Product = require('../models/Product');
const redisClient = require('../redisClient');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const client = redisClient.getClient();
    
    // Check cache first
    if (client && client.isOpen) {
      const cachedProducts = await client.get('products:all');
      if (cachedProducts) {
        console.log('Cache hit for products:all');
        return res.json(JSON.parse(cachedProducts));
      }
    }

    // Cache miss or Redis unavailable
    console.log('Cache miss for products:all, querying MongoDB');
    const products = await Product.find();
    
    // Store in cache for 1 hour
    if (client && client.isOpen) {
      await client.setEx('products:all', 3600, JSON.stringify(products));
    }
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a product
router.post('/', protect, admin, async (req, res) => {
  const product = new Product(req.body);
  try {
    const newProduct = await product.save();
    
    // Invalidate cache
    const client = redisClient.getClient();
    if (client && client.isOpen) {
      await client.del('products:all');
    }

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a product
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    
    // Invalidate cache
    const client = redisClient.getClient();
    if (client && client.isOpen) {
      await client.del('products:all');
    }

    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Invalidate cache
    const client = redisClient.getClient();
    if (client && client.isOpen) {
      await client.del('products:all');
    }

    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
