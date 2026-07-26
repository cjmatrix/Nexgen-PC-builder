import { Redis } from "ioredis";


const redisOptions = {
  maxRetriesPerRequest: null,
};


const redisConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, redisOptions)
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      ...redisOptions,
    });

redisConnection.on("connect", () => {
  console.log("Redis Connected Successfully!");
});

redisConnection.on("error", (err) => {
  console.error("Redis Connection Error:", err);
});

export { redisConnection };
