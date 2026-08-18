require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const amqp = require('amqplib');
const Cart = require('./models/Cart');

const app = express();
const PORT = process.env.PORT || 5003;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'cart-service' });
});

const cartRoutes = require('./routes/cartRoutes');
app.use('/api/cart', cartRoutes);

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo-cart-db:27017/cart_db';

mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// RabbitMQ Consumer setup
const connectRabbitMQ = async () => {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq-svc:5672';
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();
    
    const exchange = 'orders_exchange';
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, exchange, '');

    console.log(`[*] Cart Service waiting for messages in ${q.queue}`);

    channel.consume(q.queue, async (msg) => {
      if (msg.content) {
        const orderData = JSON.parse(msg.content.toString());
        console.log(`[x] Received OrderPlaced event for user ${orderData.userId}`);
        
        // Clear the cart asynchronously
        let cart = await Cart.findOne({ userId: orderData.userId });
        if (cart) {
          cart.items = [];
          cart.updatedAt = Date.now();
          await cart.save();
          console.log(`    -> Cart cleared for user ${orderData.userId}`);
        }
      }
    }, { noAck: true });

  } catch (error) {
    console.error('Failed to connect to RabbitMQ, retrying in 5 seconds...', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
  connectRabbitMQ();
});
