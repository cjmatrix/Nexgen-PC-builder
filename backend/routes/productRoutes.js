const express=require('express');

const router=express.Router();

const { getPublicProducts, getProductById } = require("../controllers/productController");
const {protect}=require('../middleware/authMiddleware')

router.use(protect)

router.get("/", getPublicProducts);
router.get("/:id", getProductById); 

module.exports = router;