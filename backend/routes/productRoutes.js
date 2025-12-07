const express=require('express');

const router=express.Router();

const { getPublicProducts, getProductById } = require("../controllers/productController");


router.get("/", getPublicProducts);
router.get("/:id", getProductById); 

module.exports = router;