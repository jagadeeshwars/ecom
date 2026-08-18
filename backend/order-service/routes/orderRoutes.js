const express = require('express');
const amqp = require('amqplib');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Get order history for a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Checkout and create an order
router.post('/checkout', protect, async (req, res) => {
  try {
    const { userId, items, totalAmount } = req.body;
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const order = new Order({
      userId,
      items,
      totalAmount,
      status: 'Paid'
    });

    const savedOrder = await order.save();

    // Publish event to RabbitMQ
    try {
      const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq-svc:5672';
      const connection = await amqp.connect(rabbitMqUrl);
      const channel = await connection.createChannel();
      const exchange = 'orders_exchange';
      
      await channel.assertExchange(exchange, 'fanout', { durable: false });
      channel.publish(exchange, '', Buffer.from(JSON.stringify(savedOrder)));
      
      console.log(`[x] Published OrderPlaced event for Order ${savedOrder._id}`);
      setTimeout(() => { connection.close(); }, 500);
    } catch (msgErr) {
      console.error('Failed to publish event to RabbitMQ', msgErr);
    }

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
