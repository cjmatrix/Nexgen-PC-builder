import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.js';
import { redisConnection } from '../config/redis.js'


export const emailQueue = new Queue('email-queue', {connection:redisConnection });


export const addEmailJob = async (data) => {
  // data = { email: "user@example.com", subject: "Welcome"..............}
  await emailQueue.add('send-email', data, {
    attempts: 3,        
    backoff: 5000,     
    removeOnComplete: true, 
  });
};
