import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    orderId: { type: String, required: true },
    itemId:{ type: String, required: true },
    reason: { type: String, required: true },
    quantity:{type:Number,required:true},
   components: [
      {
        type: { 
          type: String, 
          required: true,
          enum: ["cpu", "gpu", "motherboard", "ram", "storage", "case", "psu", "cooler"] 
        }, 
        componentId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Component", 
          required: true 
        }
      }
    ],
    blacklistedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Blacklist", blacklistSchema);
