const { createClient } = require('redis');

let redisClient;

const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL || 'redis://ecom-redis-svc:6379';
  redisClient = createClient({ url: redisUrl });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
  });

  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis. Continuing without cache...');
    // We don't crash the app if Redis is down, we just won't cache.
  }
};

connectRedis();

module.exports = {
  getClient: () => redisClient
};
