const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const RefreshToken = require("../models/refreshTokenModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const {
  generateAccessToken,
  issueTokens,
  refreshCookieOptions,
} = require("../utils/tokens.js");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Shape the user object we send back to the client (never includes password).
const publicUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  authProvider: user.authProvider,
  avatar: user.avatar,
});

// @desc Register a user
// @route POST /api/users/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }
  const usernameExists = await User.exists({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error("Username already taken");
  }
  const userExists = await User.exists({ email });
  if (userExists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    authProvider: "local",
  });

  // Auto-login the newly registered user.
  const { accessToken, refreshToken } = await issueTokens(user);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
  res.status(201).json({ accessToken, user: publicUser(user) });
});

// @desc Login a user
// @route POST /api/users/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400);
    throw new Error("Please fill all the fields!");
  }
  const user = await User.findOne({ username });
  if (!user || user.authProvider !== "local" || !user.password) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  if (await bcrypt.compare(password, user.password)) {
    const { accessToken, refreshToken } = await issueTokens(user);
    res.cookie("refreshToken", refreshToken, refreshCookieOptions());
    res.status(200).json({ accessToken, user: publicUser(user) });
  } else {
    res.status(401);
    throw new Error("Invalid credentials");
  }
});

// @desc Login or register a user with a Google ID token
// @route POST /api/users/google
// @access Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error("Missing Google credential");
  }
  if (!process.env.GOOGLE_CLIENT_ID) {
    res.status(500);
    throw new Error("Google login is not configured on the server");
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error("Invalid Google credential");
  }

  const { sub: googleId, email, name, picture } = payload;

  // Find by googleId first, then fall back to email to link existing accounts.
  let user = await User.findOne({ googleId });
  if (!user) {
    user = await User.findOne({ email });
    if (user) {
      // Link Google to an existing local account.
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    } else {
      // Create a fresh Google-backed account with a unique username.
      let username = (name || email.split("@")[0]).replace(/\s+/g, "");
      if (await User.exists({ username })) {
        username = `${username}_${googleId.slice(-5)}`;
      }
      user = await User.create({
        username,
        email,
        authProvider: "google",
        googleId,
        avatar: picture,
      });
    }
  }

  const { accessToken, refreshToken } = await issueTokens(user);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions());
  res.status(200).json({ accessToken, user: publicUser(user) });
});

// @desc Issue a new access token using the refresh-token cookie
// @route POST /api/users/refresh
// @access Public (requires valid refresh cookie)
const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("No refresh token");
  }

  const stored = await RefreshToken.findOne({ token });
  if (!stored) {
    res.status(401);
    throw new Error("Refresh token revoked or expired");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    await RefreshToken.deleteOne({ token });
    res.status(401);
    throw new Error("Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error("User no longer exists");
  }

  const accessToken = generateAccessToken(user);
  res.status(200).json({ accessToken, user: publicUser(user) });
});

// @desc Logout a user (revoke the refresh token)
// @route POST /api/users/logout
// @access Public
const logoutUser = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await RefreshToken.deleteOne({ token });
  }
  res.clearCookie("refreshToken", refreshCookieOptions());
  res.status(200).json({ message: "Logged out successfully" });
});

// @desc Get current user
// @route GET /api/users/current
// @access Private
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.status(200).json(publicUser(user));
});

module.exports = {
  registerUser,
  loginUser,
  googleAuth,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
};
