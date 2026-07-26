import { Queue } from "bullmq";
import { redisConfig } from "../config/redis.js";
import { redisConnection } from '../config/redis.js'


const aiQueue=new Queue ('ai-queue',{connection:redisConnection});

export const addAiJob=async(data)=>{
    aiQueue.add('generate-pc',data, {
    attempts: 1,        
    backoff: 5000,     
    removeOnComplete: true, // it going to  auto-delete job after success
  });
    
}
