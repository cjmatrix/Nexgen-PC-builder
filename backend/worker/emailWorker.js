import { redisConfig, redisConnection } from "../config/redis.js";
import { Worker } from "bullmq";
import sendEmail from "../utils/sendEmail.js";

const emailWorker= new Worker ("email-queue",async(job)=>{

    
    const {email,subject,message}=job.data;
     console.log(`Processing email for ${email}...`);

     await sendEmail({email,subject,message});

      console.log(`Email sent to ${email}`);
},{connection:redisConfig,concurrency:50})



emailWorker.on("failed",(job,err)=>{
    console.error(`Job ${job.id} failed: ${err.message}`);
}) ;

export default emailWorker