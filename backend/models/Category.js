import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    offer: {
      type: Number,
      default: 0,
      min: 0,
      max: 99,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);



export default mongoose.model("Category", categorySchema);