import { generateResponse, ai } from "../config/gemini.js";
import Component from "../models/Component.js";
import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import AppError from "../utils/AppError.js";
import Category from "../models/Category.js"

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "nexgen-pc-builds" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const aiController = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    throw new AppError("Prompt is required", 400);
  }

  const components = await Component.find({ isActive: true });

  const simplifiedComponents = components.map((c) => ({
    id: c._id,
    name: c.name,
    category: c.category,
    price: c.price,
    specs: c.specs,
  }));

  const simplifiedCategory= await Category.find({isActive:true})
  const categories=simplifiedCategory.map((category)=>({
    category:category.name,
    id:category._id
  }))


  const selectionPrompt = `
      You are a PC building expert. A user wants: "${prompt}".
      Available components are provided below in JSON format.
      
      Select the best compatible components (cpu, gpu, motherboard, ram, storage, case, psu, cooler) from the list.
      Ensure compatibility (socket, wattage, form factor, etc.).
      Also determine the best category for this build from these options: ${simplifiedCategory}.
      
      Return ONLY a JSON object with this exact structure (no markdown, no extra text):
      {
        "name": "Suggested Build Name",
        "description": "Short description of why this build is good.",
        "category": "ID_HERE", 
        "components": {
           "cpu": "ID_HERE",
           "gpu": "ID_HERE",
           "motherboard": "ID_HERE",
           "ram": "ID_HERE",
           "storage": "ID_HERE",
           "case": "ID_HERE",
           "psu": "ID_HERE",
           "cooler": "ID_HERE"
        }
      }

      Components:
      ${JSON.stringify(simplifiedComponents)}
    `;

  let selectionResult = await generateResponse(selectionPrompt);

  selectionResult = selectionResult
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let buildData;
  try {
    buildData = JSON.parse(selectionResult);
  } catch (e) {
    console.error("Failed to parse Gemini response:", selectionResult);
    throw new AppError("AI failed to generate a valid configuration.", 500);
  }

  let totalPrice = 0;
  const componentIds = Object.values(buildData.components);
  const selectedComponents = components.filter((c) =>
    componentIds.includes(c._id.toString())
  );

  if (selectedComponents.length !== 8) {
    throw new AppError("AI selected incomplete components", 500);
  }

  selectedComponents.forEach((c) => (totalPrice += c.price));

  const imageUrls = [];
  console.log(selectedComponents.find((c) => c.category === "case")?.name);

  try {
    const basePrompt = `A photorealistic, high-quality image of a custom ${prompt} PC. 
      Style: ${buildData.name}. 
      Case: ${
        selectedComponents.find((c) => c.category === "case")?.name ||
        "Gaming Case"
      }.
      Cooler: ${
        selectedComponents.find((c) => c.category === "cooler")?.name ||
        "High Performance Cooler"
      }.
      Cpu:${selectedComponents.find((c) => c.category === "cpu")?.name}.
      
      Ram:${selectedComponents.find((c) => c.category === "ram")?.name}.
      Psu:${selectedComponents.find((c) => c.category === "psu")?.name}.
      Motherboard:${
        selectedComponents.find((c) => c.category === "motherboard")?.name
      }.
      
      Lighting: RGB, dramatic, cinematic, 8k, detailed, realistic`;

    const angles = [
      "Cinematic 3/4 View",
      "Front View",
      "Close-up Internal Components View",
    ];

    const imagePromises = angles.map(async (angle) => {
      const finalPrompt = `${basePrompt}. ${angle}`;
      const encodedPrompt = encodeURIComponent(finalPrompt);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${Math.floor(
        Math.random() * 1000
      )}&model=flux`;

      const response = await fetch(pollinationsUrl);
      if (!response.ok) {
        throw new Error(
          `Pollinations API failed with status: ${response.status}`
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return uploadToCloudinary(buffer);
    });

    const urls = await Promise.all(imagePromises);
    imageUrls.push(...urls);
  } catch (err) {
    console.warn("Image generation failed, using fallback.", err.message);

    const caseComp = selectedComponents.find((c) => c.category === "case");
    if (caseComp && caseComp.image) {
      imageUrls.push(caseComp.image);
    }
  }

  if (imageUrls.length === 0) {
    imageUrls.push("https://res.cloudinary.com/demo/image/upload/v1/sample");
  }



  const newProduct = new Product({
    name: buildData.name,
    description: buildData.description,
    category: category,
    base_price: totalPrice,
    images: imageUrls,
    default_config: buildData.components,
    isActive: true,
    is_ai_generated: true,
  });

  const savedProduct = await newProduct.save();

  const populatedProduct = await Product.findById(savedProduct._id).populate({
    path: "default_config.cpu default_config.gpu default_config.motherboard default_config.ram default_config.storage default_config.case default_config.psu default_config.cooler",
    select: "name price image specs",
  });

  res.status(201).json({
    success: true,
    product: populatedProduct,
  });
};

export { aiController };
