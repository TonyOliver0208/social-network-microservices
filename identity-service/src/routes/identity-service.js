const express = require("express");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} = require("../controllers/identity-controller");
const { sensitiveEndpointsLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.post("/register", sensitiveEndpointsLimiter, registerUser);
router.post("/login", sensitiveEndpointsLimiter, loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);

module.exports = router;
