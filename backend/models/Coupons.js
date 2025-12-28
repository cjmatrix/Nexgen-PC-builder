import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discountValue: { type: Number, required: true },

    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number, default: null },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000 },
    usageCount: { type: Number, default: 0 },

    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // 4. Product Restrictions (Scenario B)
    // If empty = Applies to whole cart. If populated = Only applies to these items.
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    applicableCategories: [{ type: String }], // e.g., ["Gaming", "Office"]

    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
