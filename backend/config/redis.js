import { Redis } from "ioredis";

const REDIS_URL = "redis://red-d9iqg6ernols73fnjugg:6379";

// Build the config object used by BullMQ (needs host/port, not a URL string)
let redisConfig;

if (REDIS_URL) {
  // Parse the Render-provided URL  e.g. redis://red-xxx:6379
  const parsed = new URL(REDIS_URL);
  redisConfig = {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    ...(parsed.password && { password: parsed.password }),
    maxRetriesPerRequest: null, // REQUIRED for BullMQ
  };
} else {
  // Local dev fallback
  redisConfig = {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: null, // REQUIRED for BullMQ
  };
}

// Standalone ioredis connection (used for caching, pub/sub, rate-limiting)
const redisConnection = new Redis(redisConfig);

redisConnection.on("connect", () => {
  console.log(`✅ Redis Connected (${REDIS_URL ? "Render" : "Local"})`);
});

redisConnection.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err);
});

export { redisConnection, redisConfig };
