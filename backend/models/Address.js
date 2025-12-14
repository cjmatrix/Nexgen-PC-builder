import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    // Link to the User who owns this address
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster queries (e.g., "Find all addresses for User X")
    },

    // Contact Info for this specific address (might differ from account name)
    fullName: {
      type: String,
      required: [true, "Please add a recipient name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please add a contact phone number"],
    },

    // Location Details
    street: {
      type: String,
      required: [true, "Please add street address"],
    },
    city: {
      type: String,
      required: [true, "Please add city"],
    },
    state: {
      type: String,
      required: [true, "Please add state"],
    },
    postalCode: {
      type: String,
      required: [true, "Please add postal/zip code"],
    },
    country: {
      type: String,
      default: "India", // or required if you ship internationally
    },

    // Logic Flags
    isDefault: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Optional: Ensure a user only has one default address?
// This logic is usually best handled in the Controller (set all others to false before saving this one),
// but the Schema is ready for it.

export default mongoose.model("Address", addressSchema);
