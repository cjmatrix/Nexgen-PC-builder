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

    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    applicableCategories: [{ type: String }], 

    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


couponSchema.pre('validate', function() {
 

  if (this.discountType === 'fixed' && this.discountValue >= this.minOrderValue) {
     this.invalidate('discountValue', 'Fixed discount value cannot exceed or equal minimum order value');
  }
  
});

export default mongoose.model("Coupon", couponSchema);
