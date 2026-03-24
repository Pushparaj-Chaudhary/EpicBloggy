import express from "express";
import { registerUser, loginUser, getMe, verifyEmail, resendOtp, sendResetOtp, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/send-reset-otp", sendResetOtp);
router.post("/reset-password", resetPassword);

export default router;
