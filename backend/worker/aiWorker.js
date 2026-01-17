import { Worker } from "bullmq";
import { redisConfig, redisConnection } from "../config/redis.js";
import { generatePCBuild } from "../services/aiService.js";
import { sendNotificationToUser } from "../controllers/notificationController.js";
import Notification from "../models/Notification.js";

const aiWorker = new Worker(
  "ai-queue",
  async (job) => {
    const { prompt, userId, buildId } = job.data;

    console.log(`Processing the build...`);


    const aiProduct = await generatePCBuild(prompt);

    console.log(`build completed...`);

    const redisKey = `ai_build:${buildId}`;

    await redisConnection.set(
      redisKey,
      JSON.stringify(aiProduct),
      "EX",
      60 * 60 * 24
    );


    await Notification.create({
      user: userId,
      message: `Your build "${aiProduct.name}" is ready! Click to view.`,
      type: "success",
      link: `/ai-build-preview/${buildId}`,
    });

    

    sendNotificationToUser(userId, {
      message: `Your build "${aiProduct.name}" is ready!`,
      link: `/ai-build-preview/${buildId}`,
      aiProduct
    });



  },
  { connection: redisConfig, concurrency: 10 }
);

aiWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

export default aiWorker;
