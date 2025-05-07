const express = require("express");
const {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
} = require("../controllers/identity-controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);

module.exports = router;
