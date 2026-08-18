require('dotenv').config();
const express = require('express');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 5005;

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// RabbitMQ Consumer setup
const connectRabbitMQ = async () => {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || 'amqp://rabbitmq-svc:5672';
    const connection = await amqp.connect(rabbitMqUrl);
    const channel = await connection.createChannel();
    
    const exchange = 'orders_exchange';
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    // Assert a queue and bind it to the exchange
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, exchange, '');

    console.log(`[*] Notification Service waiting for messages in ${q.queue}`);

    channel.consume(q.queue, (msg) => {
      if (msg.content) {
        const orderData = JSON.parse(msg.content.toString());
        console.log(`[x] Received OrderPlaced event: Order ID ${orderData._id}`);
        // Simulate sending an email
        console.log(`    -> Sending email receipt to User ${orderData.userId} for $${orderData.totalAmount}`);
      }
    }, { noAck: true });

  } catch (error) {
    console.error('Failed to connect to RabbitMQ, retrying in 5 seconds...', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
};

// Start server
app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
  connectRabbitMQ();
});
