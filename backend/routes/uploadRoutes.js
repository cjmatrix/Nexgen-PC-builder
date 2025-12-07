const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); 


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }


  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: 'nexgen-pc-parts', 
    },
    (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Cloudinary upload failed' });
      }
      // Success! Return the URL
      res.status(200).json({
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url,
      });
    }
  );

  // Pipe the file buffer into the stream
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

module.exports = router;