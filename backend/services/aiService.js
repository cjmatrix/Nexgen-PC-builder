import { generateResponse } from "../config/gemini.js";
import Component from "../models/Component.js";
import Category from "../models/Category.js";
import AppError from "../utils/AppError.js";

export const generatePCBuild = async (prompt) => {
  const components = await Component.find({ isActive: true });




  const simplifiedComponents = components.map((c) => ({
    id: c._id,
    name: c.name,
    category: c.category,
    price: c.price / 100,
    specs: c.specs,
  }));

  const simplifiedCategory = await Category.find({ isActive: true });
  const categories = simplifiedCategory.map((category) => ({
    category: category.name,
    id: category._id,
  }));

  const selectionPrompt = `
      You are a PC building expert and component price in rupees. A user wants: "${prompt}".
      Available components are provided below in JSON format.
      
      Select the best compatible components (cpu, gpu, motherboard, ram, storage, case, psu, cooler) from the list.
      Select the best compatible components (cpu, gpu, motherboard, ram, storage, case, psu, cooler) from the list.
      Ensure compatibility (socket, wattage, form factor, etc.).
      Also determine the best category for this build from these options: ${JSON.stringify(
        categories
      )}.
      
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
  const caseComp = selectedComponents.find((c) => c.category === "case");
  if (caseComp && caseComp.image) {
    imageUrls.push(caseComp.image);
  }

  if (imageUrls.length === 0) {
    imageUrls.push("https://res.cloudinary.com/demo/image/upload/v1/sample");
  }

  const newProduct = {
    name: buildData.name,
    description: buildData.description,
    category: buildData.category,
    base_price: totalPrice,
    images: imageUrls,
    default_config: selectedComponents,
    isActive: true,
    is_ai_generated: true,
    slug:
      buildData.name.toLowerCase().split(" ").join("-") +
      "-" +
      Date.now() +
      Math.floor(Math.random() * 1000),
  };

  return newProduct;
};

export default {
  generatePCBuild,
};
