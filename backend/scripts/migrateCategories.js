import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

dotenv.config();

const migrateCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check.`);

    for (const product of products) {
      // Check if category is already an ObjectId (optimization if re-run)
      if (mongoose.Types.ObjectId.isValid(product.category)) {
        console.log(
          `Product ${product.name} already has ObjectId category. Skipping.`
        );
        continue;
      }

      console.log(
        `Processing product: ${product.name} with category: "${product.category}"`
      );

      const categoryDoc = await Category.findOne({ name: product.category });

      if (categoryDoc) {
        // We bypass the strict schema check by using updateOne directly or casting
        // Since we are changing the type of data in the field, straightforward save() might fail
        // if the model schema insists it's a string (it is currently).
        // ACTUALLY: The safest way is to use updateOne which bypasses Mongoose validation for that doc

        await Product.updateOne(
          { _id: product._id },
          { $set: { category: categoryDoc._id } }
        );
        console.log(
          `Updated ${product.name} to category ID: ${categoryDoc._id}`
        );
      } else {
        console.warn(
          `Category "${product.category}" not found in Category collection! Content might be lost or check manually.`
        );
      }
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateCategories();
