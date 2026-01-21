import express from "express";
const router=express.Router();
import {
  getPublicProducts,
  getProductById,

} from "../controllers/productController.js";


router.get("/", getPublicProducts);
router.get("/:id", getProductById);


export default router;
