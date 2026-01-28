import Redis from "ioredis";
import { redisConfig } from "../config/redis.js";

const redisPublisher = new Redis(redisConfig);
const redisSubscriber = new Redis(redisConfig);

const localClients = new Map();

redisSubscriber.subscribe("notifications");

redisSubscriber.on("message", (channel, message) => {
  if (channel === "notifications") {
    const { userId, messageData } = JSON.parse(message);

    if (localClients.has(userId)) {
      const userConnections = localClients.get(userId);
      userConnections.forEach((res) => {
        res.write(`data: ${JSON.stringify(messageData)}\n\n`);
      });
    }
  }
});

export const streamNotifications = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const userId = req.user._id.toString();

  if (!localClients.has(userId)) {
    localClients.set(userId, new Set());
  }
  localClients.get(userId).add(res);

  res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

  req.on("close", () => {
    const userConns = localClients.get(userId);
    if (userConns) {
      userConns.delete(res);
      if (userConns.size === 0) {
        localClients.delete(userId);
      }
    }
  });
};

export const sendNotificationToUser = async (userId, messageData) => {
  await redisPublisher.publish(
    "notifications",
    JSON.stringify({
      userId,
      messageData,
    }),
  );
};
