import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Please enter all fields." });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireAt = Date.now() + 5 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verifyOtp: otp,
      verifyOtpExpireAt: otpExpireAt
    });

    if (user) {
      await sendEmail(
        email,
        "EpicBloggy - Email Verification OTP",
        `
          <h2>Email Verification</h2>
          <h1>${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
        `
      );

      res.status(201).json({
        success: true,
        message: "OTP sent to your email. Please verify.",
        email: user.email,
      });
    } else {
      res.json({ success: false, message: "Invalid user data" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Resend OTP to email
// @route   POST /api/auth/resend-otp
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000; // 1 minute
    await user.save();

    await sendEmail(
      email,
      "EpicBloggy - Resend OTP",
      `
        <h2>Resend OTP</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `
    );

    res.json({ success: true, message: "A new OTP has been sent." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials." });
    }

    if (!user.isVerified && user.role !== 'admin') {
      return res.json({ success: false, message: "Please verify your email first." });
    }

    if (await bcrypt.compare(password, user.password)) {
      if (user.role === 'admin') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendEmail(
          email,
          "EpicBloggy - Admin Login OTP",
           `
            <h2>Admin Login OTP</h2>
            <h1>${otp}</h1>
            <p>This OTP is valid for 5 minutes.</p>
          `
        );

        return res.json({
          success: true,
          requireOtp: true,
          message: "OTP sent to your email. Please verify.",
          email: user.email,
        });
      }

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
      });
      res.json({
        success: true,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        token,
      });
    } else {
      res.json({ success: false, message: "Invalid credentials." });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.isVerified && user.role !== 'admin') {
      return res.json({ success: false, message: "User is already verified." });
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired. Please register again." });
    }

    user.isVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token,
      message: "Email verified successfully.",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Send OTP to reset password
// @route   POST /api/auth/send-reset-otp
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.role === 'admin') {
      return res.json({ success: false, message: "Forgot password is only available for regular users." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity
    await user.save();

    await sendEmail(
      email,
      "EpicBloggy - Password Reset OTP",
      `
        <h2>Password Reset OTP</h2>
        <h1>${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      `
    );

    res.json({ success: true, message: "Password reset OTP sent to your email." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.role === 'admin') {
      return res.json({ success: false, message: "Forgot password is only available for regular users." });
    }

    if (user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: "Password has been reset successfully." });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
