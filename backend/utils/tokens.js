const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/refreshTokenModel.js");

const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
// Refresh token lifetime in days.
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

// Build the JWT payload we embed in the access token.
const buildUserPayload = (user) => ({
  user: {
    username: user.username,
    email: user.email,
    id: user._id,
  },
});

const generateAccessToken = (user) =>
  jwt.sign(buildUserPayload(user), process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });

// Creates a refresh token, persists it so it can be revoked on logout,
// and returns the raw token string.
const generateRefreshToken = async (user) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` }
  );

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({ token, userId: user._id, expiresAt });
  return token;
};

// Issue both tokens at once.
const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  return { accessToken, refreshToken };
};

// Cookie options for storing the refresh token as an httpOnly cookie.
const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  path: "/",
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  issueTokens,
  refreshCookieOptions,
  REFRESH_TOKEN_TTL_DAYS,
};
