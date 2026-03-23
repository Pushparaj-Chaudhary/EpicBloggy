import express from "express";
import { registerUser, loginUser, getMe, verifyEmail, resendOtp } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);

export default router;
