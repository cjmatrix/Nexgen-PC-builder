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

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    userName: { type: String, required: true },

    userEmail: { type: String, required: true },

    orderId: { type: String, required: true },

    orderItems: [
      {
        status: {
          type: String,
          enum: [
            "Active",
            "Cancelled",
            "Returned",
            "Return Requested",
            "Return Approved",
            "Return Rejected",
          ],
          default: "Active",
        },
        cancellationReason: { type: String },
        returnReason: { type: String },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        discount: { type: Number, default: 0 },

        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: false, // Changed from true to false for Custom Builds
          ref: "Product",
        },
        isCustomBuild: { type: Boolean, default: false },
        isAiBuild: { type: Boolean, default: false },

        components: {
          cpu: { type: componentSnapshotSchema, required: true },
          gpu: { type: componentSnapshotSchema, required: true },
          motherboard: { type: componentSnapshotSchema, required: true },
          ram: { type: componentSnapshotSchema, required: true },
          storage: { type: componentSnapshotSchema, required: true },
          case: { type: componentSnapshotSchema, required: true },
          psu: { type: componentSnapshotSchema, required: true },
          cooler: { type: componentSnapshotSchema, required: true },
        },
        aiImages: { type: String },
      },
    ],

    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },

    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },

    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    couponDiscount: { type: Number, default: 0.0 },

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    cancellationReason: { type: String },
    returnReason: { type: String },
    isReturned: { type: Boolean, default: false },

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Return Requested",
        "Return Approved",
        "Return Rejected",
      ],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
