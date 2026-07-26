import { Redis } from "ioredis";


const redisConfig = {
  maxRetriesPerRequest: null, 
};


const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisConfig)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      ...redisConfig,
    });

redisConnection.on("connect", () => {
  console.log("Redis Connected Successfully!");
});

redisConnection.on("error", (err) => {
  console.error("Redis Connection Error:", err);
});


export { redisConnection, redisConfig };
