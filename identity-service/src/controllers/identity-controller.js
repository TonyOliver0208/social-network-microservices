const User = require("../models/User");
const {
  asyncHandler,
  throwValidationError,
  APIError,
} = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { validateRegistration, validateLogin } = require("../utils/validation");
const generateToken = require("../utils/generateToken");
const RefreshToken = require("../models/RefreshToken");

const registerUser = asyncHandler(async (req, res) => {
  logger.info("Registration endpoint hit...");
  const { error } = validateRegistration(req.body);

  if (error) {
    logger.warn("Validation error", error.details[0].message);
    throwValidationError(error.details[0].message);
  }

  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    logger.warn("User already exist!");
    throw new APIError(400, "User already exist!");
  }

  const newUser = new User({
    username,
    email,
    password,
  });

  await newUser.save();

  logger.warn("Created a new user successfully!", newUser._id);

  const { accessToken, refreshToken } = await generateToken(newUser);

  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
    accessToken,
    refreshToken,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  logger.info("Login endpoint hit...");

  const { error } = validateLogin(req.body);

  if (error) {
    logger.warn("Validation error", error.details[0].message);
    throwValidationError(error.details[0].message);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    logger.warn("This user is not exist!");
    throw new APIError(400, "This user is not exist!");
  }

  const isValidPassword = await user.comparePassword(password);

  if (!isValidPassword) {
    logger.warn("Password is not correct");
    throw new APIError(400, "Password is not correct! Please try again!");
  }

  const { accessToken, refreshToken } = await generateToken(user);

  logger.info("Login successfully", user._id);

  return res.status(200).json({
    success: true,
    message: "Login successfully",
    accessToken,
    refreshToken,
    userId: user._id,
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  logger.info("Refresh token endpoint hit...");

  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn("Refresh token missing");
    throw new APIError(400, "Refresh token is required");
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });

  if (!storedToken) {
    logger.warn("Refresh token not found in DB");
    throw new APIError(400, "Invalid refresh token");
  }

  if (storedToken.expiresAt < new Date()) {
    logger.warn("Refresh token expired");
    await RefreshToken.deleteOne({ _id: storedToken._id });
    throw new APIError(400, "Refresh token has expired");
  }

  const user = await User.findById(storedToken.user);

  if (!user) {
    logger.warn("User not found for refresh token");
    throw new APIError(400, "User no longer exists");
  }

  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateToken(user);

  await RefreshToken.deleteOne({ token: refreshToken });

  logger.info(`Refresh token rotated for user ${user._id}`);

  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    userId: user._id,
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  logger.info("Logout endpoint hit...");

  const { refreshToken } = req.body;

  if (!refreshToken) {
    logger.warn("Refresh token missing");
    throw new APIError(400, "Refresh token is required");
  }

  const storedToken = await RefreshToken.findOneAndDelete({
    token: refreshToken,
  });

  if (!storedToken) {
    logger.warn("Refresh token not found in DB");
    throw new APIError(400, "Invalid refresh token");
  }

  logger.info("Refresh token deleted for logout");

  res.json({
    success: true,
    message: "Logged out successfully!",
  });
});

module.exports = { registerUser, loginUser, refreshToken, logoutUser };
