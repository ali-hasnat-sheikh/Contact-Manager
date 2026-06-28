const express = require("express");
const router = express.Router();
const validateTokenHandler = require("../middleware/validateTokenHandler.js");

const {
  registerUser,
  loginUser,
  googleAuth,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
} = require("../controllers/userController.js");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/google", googleAuth);

router.post("/refresh", refreshAccessToken);

router.post("/logout", logoutUser);

router.get("/current", validateTokenHandler, getCurrentUser);

module.exports = router;
