import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
   
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, 
    },

  
    fullName: {
      type: String,
      required: [true, "Please add a recipient name"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Please add a contact phone number"],
    },

 
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
      default: "India",
    },

    
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

export default mongoose.model("Address", addressSchema);
