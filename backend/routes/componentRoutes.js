import express from "express";
const router = express.Router();
import { getComponents } from "../controllers/componentController.js";

router.get("/", getComponents);

export default router;
