import { Redis } from "ioredis";


const redisConfig = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
};

// Create a connection instance (for general caching if needed)
const redisConnection = new Redis(redisConfig);

redisConnection.on("connect", () => {
  console.log(" Redis Connected (Local Ubuntu)");
});

redisConnection.on("error", (err) => {
  console.error(" Redis Connection Error:", err);
});

export { redisConnection, redisConfig };