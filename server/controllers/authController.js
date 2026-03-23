import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import transporter from "../config/nodemailer.js";

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
    const otpExpireAt = Date.now() + 1 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verifyOtp: otp,
      verifyOtpExpireAt: otpExpireAt
    });

    if (user) {
      const mailOptions = {
        from: process.env.SMTP_USER || "noreply@epicbloggy.com",
        to: email,
        subject: "EpicBloggy - Email Verification OTP",
        text: `Your OTP for email verification is ${otp}. It will expire in 1 minutes.`,
      };

      try {
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
          transporter.sendMail(mailOptions).catch(err => console.error("Error sending email:", err));
        } else {
          console.log(`[DEV MODE] OTP for ${email} is ${otp}`);
        }
      } catch (error) {
        console.error("Error configuring email:", error);
      }

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
    user.verifyOtpExpireAt = Date.now() + 1 * 60 * 1000; // 1 minute
    await user.save();

    const mailOptions = {
      from: process.env.SMTP_USER || "noreply@epicbloggy.com",
      to: email,
      subject: "EpicBloggy - Resend OTP",
      text: `Your new OTP is ${otp}. It will expire in 1 minute.`,
    };

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter.sendMail(mailOptions).catch(err => console.error("Error sending email:", err));
      } else {
        console.log(`[DEV MODE] Resent OTP for ${email} is ${otp}`);
      }
    } catch (error) {
      console.error("Error configuring email:", error);
    }

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
        user.verifyOtpExpireAt = Date.now() + 1 * 60 * 1000;
        await user.save();

        const mailOptions = {
          from: process.env.SMTP_USER || "noreply@epicbloggy.com",
          to: email,
          subject: "EpicBloggy - Admin Login OTP",
          text: `Your OTP for admin login is ${otp}. It will expire in 1 minutes.`,
        };

        try {
          if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter.sendMail(mailOptions).catch(err => console.error("Error sending email:", err));
          } else {
            console.log(`[DEV MODE] Admin Login OTP for ${email} is ${otp}`);
          }
        } catch (error) {
          console.error("Error configuring email:", error);
        }

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
