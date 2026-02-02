import { Queue } from "bullmq";
import { redisConfig } from "../config/redis.js";


const aiQueue=new Queue ('ai-queue',{connection:redisConfig});

export const addAiJob=async(data)=>{
    aiQueue.add('generate-pc',data, {
    attempts: 1,        
    backoff: 5000,     
    removeOnComplete: true, // it going to  auto-delete job after success
  });
    
}