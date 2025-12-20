// backend/controllers/userController.js

const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const transporter = require("../config/email");
const crypto = require("crypto");

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found with this email.");
  }

  // Get Reset Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false }); // Sirf token save karein

  // Create Reset URL (Frontend URL)
  // ⚠️ Note: Localhost:3000 ya aapka frontend domain
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  const message = `
    <h1>Password Reset Request</h1>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    <p>If you did not make this request, please ignore this email.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_SERVICE_USER,
      to: user.email,
      subject: "Rao Sahab Wear: Password Reset",
      html: message,
    });

    res.json({ success: true, data: "Email sent" });
  } catch (error) {
    console.error(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Reset Password
// @route   PUT /api/users/reset-password/:resetToken
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }, // Check expiry
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or Expired Token");
  }

  // Set new password
  user.password = req.body.password;

  // Clear reset fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // Save (Middleware will hash the new password automatically)
  await user.save();

  res.json({
    success: true,
    token: generateToken(user._id), // Optionally log them in directly
    message: "Password Updated Successfullly",
  });
});
// Helper function to generate 6-digit OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// @desc    Send OTP for user registration
// @route   POST /api/users/send-otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  const userExists = await User.findOne({ email, isVerified: true });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists and is verified.");
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  let user = await User.findOne({ email });

  // 🟢 FIX 1: Ensure password is set/updated ONLY if user exists
  if (user) {
    // User already exists (unverified), just update temp fields and password
    user.name = name;
    user.password = password; // pre('save') hook will hash this new password
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
  } else {
    // New user, create them (password hashes on creation)
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

  // --- Email Sending Logic ---
  const mailOptions = {
    from: process.env.EMAIL_SERVICE_USER,
    to: email,
    subject: "Rao Sahab Wear: OTP Verification",
    html: `<h2>Email Verification Code</h2><p>Your 6-digit verification code is:</p><h1 style="color: #ff0055; font-size: 24px; letter-spacing: 5px;">${otp}</h1><p>This code is valid for 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully to your email." });
  } catch (error) {
    console.error("Email sending error:", error);
    // OTP data DB में सेव हो चुका है, इसलिए यूजर को आगे बढ़ने दें, लेकिन एरर लॉग करें
    res.json({
      message: "OTP sent successfully, but check server log for email error.",
    });
  }
});

// @desc    Verify OTP and finalize registration
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    res.status(401);
    throw new Error("Verification failed. User not found or already verified.");
  }

  // 1. OTP and expiry check
  if (user.otp !== otp || user.otpExpires < Date.now()) {
    res.status(401);
    throw new Error("Invalid or expired OTP.");
  }

  // 2. Finalize registration (Only modify isVerified status)
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  // 🟢 FIX 2: Password field is NOT modified here, so hashing is bypassed.
  await user.save();

  // 3. Send response with JWT Token
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: true,
    token: generateToken(user._id),
  });
});

// @desc    Auth user & get token (Login)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // 1. Check if user exists and password matches
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
    // This is the line throwing the error if password mismatch occurs.
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const updateUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.cart = req.body.cart; // Frontend se pura cart array aayega
    await user.save();
    res.json(user.cart);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user.cart);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const address = req.body; // Frontend se pura address object aayega
    user.addressList.push(address); // List mein add karo
    await user.save();
    res.status(201).json(user.addressList); // Updated list wapas bhejo
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // Filter karke wo address hatao jiski ID match kare
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

// @desc    Get all addresses
// @route   GET /api/users/address
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user.addressList);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (user) res.json(user);
  else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
module.exports = {
  authUser,
  sendOtp,
  verifyOtp,
  forgotPassword, // 🟢 NEW
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
