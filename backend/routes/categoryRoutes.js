import express from "express"

import { protect } from "../middleware/authMiddleware.js"
import { getCategories } from "../controllers/categoryController.js";

const router=express.Router()

router.use(protect);

router.get("/",getCategories)

export default router
