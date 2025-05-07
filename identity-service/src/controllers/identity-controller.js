const User = require("../models/User");
const {
  asyncHandler,
  throwValidationError,
  APIError,
} = require("../middleware/errorHandler");
const logger = require("../utils/logger");
const { validateRegistration } = require("../utils/validation");
const generateToken = require("../utils/generateToken");

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

module.exports = { registerUser };
