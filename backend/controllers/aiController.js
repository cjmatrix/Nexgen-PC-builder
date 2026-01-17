import { addAiJob } from "../queues/aiQueue.js";
import aiService from "../services/aiService.js";
import AppError from "../utils/AppError.js";
import {v4 as uuidv4} from 'uuid'
const aiController = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    throw new AppError("Prompt is required", 400);
  }

  // const newProduct = await aiService.generatePCBuild(prompt);
     await addAiJob({prompt,userId:req.user._id,buildId:uuidv4()})

  res.status(200).json({
    success: true,
    message:"You request is processing we will notify after done"
  });
};

export { aiController };
