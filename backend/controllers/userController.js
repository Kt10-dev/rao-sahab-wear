const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../config/email");
const crypto = require("crypto");

// 🛠️ HELPER: OTP Generator
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// ---------------------------------------------------------
// 🟢 1. SEND OTP
// ---------------------------------------------------------
const sendOtp = asyncHandler(async (req, res) => {
  const { name, email, password, role = "user" } = req.body;

  const userExists = await User.findOne({ email, isVerified: true });
  if (userExists) {
    res.status(400);
    throw new Error("Account already exists and is verified.");
  }

  const otp = generateOtp();
  const otpExpires = Date.now() + 10 * 60 * 1000;

  // Use findOneAndUpdate for better performance here
  let user = await User.findOneAndUpdate(
    { email },
    { name, password, otp, otpExpires, isVerified: false, role },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  try {
    await sendEmail({
      to: email,
      subject: "Rao Sahab Wear: OTP Verification",
      htmlContent: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px; background: #f4f4f4; border-radius: 10px;">
          <h2 style="color: #0BC5EA;">राम-राम, ${name}! 🎉</h2>
          <p>Your verification code for <b>Rao Sahab Wear</b> is:</p>
          <h1 style="color: #333; letter-spacing: 5px;">${otp}</h1>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
    });
    res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    res
      .status(200)
      .json({ success: true, message: "OTP saved. Check your email soon." });
  }
});

// ---------------------------------------------------------
// 🟢 2. VERIFY OTP & 3. LOGIN (AUTH)
// ---------------------------------------------------------
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
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
// 🟢 4. CART MANAGEMENT (CRITICAL FIX FOR VERSIONERROR)
// ---------------------------------------------------------

// ✅ Using findByIdAndUpdate to avoid VersionError
const updateUserCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, user missing");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { cart: req.body.cart } },
    { new: true, runValidators: true },
  );

  if (updatedUser) {
    res.json(updatedUser.cart);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }
  const user = await User.findById(req.user._id);
  res.json(user ? user.cart : []);
});

// ---------------------------------------------------------
// 🟢 5. ADDRESS & PASSWORD LOGIC (SAME AS ABOVE WITH SAFETY)
// ---------------------------------------------------------
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      htmlContent: `<h1>Reset Password</h1><p>Click link to reset:</p><a href="${resetUrl}">${resetUrl}</a>`,
    });
    res.json({ success: true, message: "Email sent" });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email delivery failed");
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

// Address Management with Safety Checks
const addAddress = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $push: { addressList: req.body } },
    { new: true },
  );
  res.status(201).json(updatedUser.addressList);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { addressList: { _id: req.params.id } } },
    { new: true },
  );
  res.json(updatedUser.addressList);
});

const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user ? user.addressList : []);
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
  user ? res.json(user) : res.status(404).json({ message: "User not found" });
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
