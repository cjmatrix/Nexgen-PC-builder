import { Redis } from "ioredis";


const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisConfig = {
  maxRetriesPerRequest: null, 
  family: 4,
};


if (redisUrl.startsWith('rediss://')) {
  redisConfig.tls = {
    rejectUnauthorized: false,
  };
}

const redisConnection = new Redis(redisUrl, redisConfig);

redisConnection.on('error', (err) => console.error('Redis Connection Error:', err));

export { redisConnection, redisConfig };
