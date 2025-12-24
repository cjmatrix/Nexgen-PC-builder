import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a product name"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
      index: true,
    },
    base_price: {
      type: Number,
      required: true,
      min: 0,
      min: 0,
      get: (v) => Math.round(v),
      set: (v) => Math.round(v),
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 99,
    },
    final_price: {
      type: Number,
      default: 0,
    },
    applied_offer: {
      type: Number,
      default: 0,
      min: 0,
      max: 99,
    },
    images: [
      {
        type: String,
      },
    ],

    default_config: {
      cpu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
      gpu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
      motherboard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
      ram: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
      storage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
      case: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
      psu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
      cooler: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Component",
        required: true,
      },
    },

    is_featured_community_build: {
      type: Boolean,
      default: false,
      index: true,
    },
    original_order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    is_ai_generated: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.pre("save", function () {
  if (this.isModified("base_price") || this.isModified("discount") ||this.isModified("applied_offer")) {
    const price = this.base_price || 0;
    const applied_offer = this.applied_offer || 0;
    this.final_price = Math.round(price * (1 - applied_offer / 100));
  }

  if (this.isModified("name")) {
    this.slug = this.name.toLowerCase().split(" ").join("-");
  }

});

export default mongoose.model("Product", productSchema);
