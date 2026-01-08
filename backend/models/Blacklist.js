import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    orderId: { type: String, required: true },
    reason: { type: String, required: true },
    components: { type: mongoose.Schema.Types.Mixed }, // Store snapshot of components like Order
    blacklistedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Blacklist", blacklistSchema);
