import express from "express";
const router = express.Router();
import upload from "../middleware/uploadMiddleware.js";

import streamifier from "streamifier";

import cloudinary from "../config/cloudinary.js";

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
 
  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: "nexgen-pc-parts",
    },
    (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Cloudinary upload failed" });
      }

      res.status(200).json({
        message: "Image uploaded successfully",
        imageUrl: result.secure_url,
      });
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

export default router;
