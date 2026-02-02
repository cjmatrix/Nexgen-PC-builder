import express from "express";
import {
  getProfile,
  postAddress,
  getAddresses,
  updateProfile,
  updateAddresses,
  deleteAddresses,
  verifyEmailChange,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/verify-email-change", verifyEmailChange);

router.post("/address", postAddress);
router.get("/address", getAddresses);
router.put("/address/:id", updateAddresses);
router.delete("/address/:id", deleteAddresses);

export default router;
