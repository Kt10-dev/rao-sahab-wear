// backend/controllers/userController.js

const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const transporter = require("../config/email");
const crypto = require("crypto");

// ---------------------------------------------------------
// 🛠️ HELPER: OTP Generator (6-digit)
// ---------------------------------------------------------
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// ---------------------------------------------------------
// 🟢 1. SEND OTP (Registration Step 1)
// ---------------------------------------------------------
const sendOtp = asyncHandler(async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  // Check if user already exists and is verified
  const userExists = await User.findOne({ email, isVerified: true });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists and is verified.");
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 Min Expiry

  let user = await User.findOne({ email });

  if (user) {
    // Unverified user exists, update details
    user.name = name;
    user.password = password; // Pre-save hook will hash this
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
  } else {
    // Create new unverified user
    user = await User.create({
      name,
      email,
      password,
      role,
      otp,
      otpExpires,
      isVerified: false,
    });
  }

  // --- Email Sending with Timeout Protection ---
  const mailOptions = {
    from: `"Rao Sahab Wear" <${process.env.EMAIL_SERVICE_USER}>`,
    to: email,
    subject: "Rao Sahab Wear: OTP Verification",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f4f4f4; padding: 20px;">
        <h2 style="color: #333;">Email Verification</h2>
        <p>Your 6-digit verification code is:</p>
        <h1 style="color: #0BC5EA; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code is valid for 10 minutes.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `,
  };

  try {
    // 💡 Render Timeout Hack: Wait max 12 seconds for email
    const sendMailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP Timeout")), 12000)
    );

    await Promise.race([sendMailPromise, timeoutPromise]);

    res.json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("❌ Email Error catch block:", error.message);
    // 💡 Rao Sahab Hack: We send success even if email times out
    // because OTP is already saved in DB. User can try again or check spam.
    res.status(200).json({
      success: true,
      message: "Processing... Please check your inbox or spam in a moment.",
      error: "Email delivery delayed",
    });
  }
});

// ---------------------------------------------------------
// 🟢 2. VERIFY OTP (Registration Step 2)
// ---------------------------------------------------------
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    res.status(401);
    throw new Error("Verification failed. User not found or already verified.");
  }

  if (user.otp !== otp || user.otpExpires < Date.now()) {
    res.status(401);
    throw new Error("Invalid or expired OTP.");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
});

// ---------------------------------------------------------
// 🟢 3. AUTH USER (Login)
// ---------------------------------------------------------
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isVerified) {
      res.status(401);
      throw new Error("Account not verified. Please verify your email first.");
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// ---------------------------------------------------------
// 🟢 4. FORGOT & RESET PASSWORD
// ---------------------------------------------------------
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found with this email.");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // LIVE URL handle karein (Development vs Production)
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `<h1>Password Reset</h1><p>Click here to reset:</p><a href="${resetUrl}">${resetUrl}</a>`;

  try {
    await transporter.sendMail({
      from: `"Rao Sahab Wear" <${process.env.EMAIL_SERVICE_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });
    res.json({ success: true, data: "Email sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email could not be sent. Check backend logs.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or Expired Token");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: "Password Updated Successfully" });
});

// ---------------------------------------------------------
// 🟢 5. CART & ADDRESS HELPERS
// ---------------------------------------------------------
const updateUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.cart = req.body.cart;
    await user.save();
    res.json(user.cart);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) res.json(user.cart);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.addressList.push(req.body);
    await user.save();
    res.status(201).json(user.addressList);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.addressList = user.addressList.filter(
      (addr) => addr._id.toString() !== req.params.id
    );
    await user.save();
    res.json(user.addressList);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) res.json(user.addressList);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

// ---------------------------------------------------------
// 🟢 6. ADMIN CONTROLLERS
// ---------------------------------------------------------
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) res.json(user);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  authUser,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  updateUserCart,
  getUserCart,
  addAddress,
  deleteAddress,
  getAddresses,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
