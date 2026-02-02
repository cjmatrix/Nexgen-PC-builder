import mongoose from "mongoose";

const componentSnapshotSchema = new mongoose.Schema(
  {
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    specs: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        isCustomBuild: {
          type: Boolean,
          default: false,
        },
        isAiBuild: {
          type: Boolean,
          default: false,
        },

        customBuild: {
          name: { type: String },
          totalPrice: { type: Number },
          isAiBuild: {
          type: Boolean,
          default: false,
          
          },
          components: {
            cpu: { type: componentSnapshotSchema },
            gpu: { type: componentSnapshotSchema },
            motherboard: { type: componentSnapshotSchema },
            ram: { type: componentSnapshotSchema },
            storage: { type: componentSnapshotSchema },
            case: { type: componentSnapshotSchema },
            psu: { type: componentSnapshotSchema },
            cooler: { type: componentSnapshotSchema },
          },
          aiImages:{type:String}
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    discount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.path("items").validate(function (items) {
  if (!items) return false;
  return items.every((item) => {
    if (item.isCustomBuild) {
      return item.customBuild && item.customBuild.totalPrice > 0;
    }

    return !!item.product;
  });
}, "Cart item must have either a valid product reference or complete custom build data.");

export default mongoose.model("Cart", cartSchema);
