const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

const streamifier = require("streamifier");

const cloudinary = require("../config/cloudinary");

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

module.exports = router;
