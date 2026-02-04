import rateLimit,{ipKeyGenerator} from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redisConnection } from "../config/redis.js";

export const globalLimiter = rateLimit({
  max: 2000,
  windowMs: 15 * 60 * 1000,
  message: "Too many requests from this IP, please try again in 15 minutes!",
});


export const aiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: "You have reached your daily limit of 5 AI generations.",
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisConnection.call(...args),
  }),
  keyGenerator: (req) => {
    if (req.user) {
      return `ai_limit_${req.user._id}`;
    }
    return `ai_limit_${ipKeyGenerator(req)}`;
  },
});
