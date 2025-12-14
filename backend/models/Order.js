import mongoose from "mongoose";

// Sub-schema to store the snapshot AND the reference for a single part
const componentSnapshotSchema = new mongoose.Schema(
  {
    // 1. THE REFERENCE (For "Add to Feature List")
    // Allows you to check if the part is still in stock before featuring it
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Component",
      required: true,
    },

    // 2. THE SNAPSHOT (For "Order History")
    // Even if the original component is deleted, this data remains.
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },

    // 3. FULL TECHNICAL SPEC SNAPSHOT
    // You requested "full spec", so we store the critical technical details here.
    // We use 'Mixed' because a CPU has different specs than a Case.
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

    orderItems: [
      {
        name: { type: String, required: true }, // e.g. "Gaming Beast (Custom)"
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true }, // Total price of this specific PC

        // Link to the BASE product (e.g., "Starter PC") they customized
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },

        // --- THE HYBRID SNAPSHOT ---
        // Contains IDs for future product creation AND data for history
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

    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },

    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
