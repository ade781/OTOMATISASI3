import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { generateRefreshToken, hashRefreshToken } from "../utils/tokens.js";
import {
  setRefreshCookie,
  clearRefreshCookie,
  setAccessCookie,
  clearAccessCookie,
  clearCsrfCookie,
} from "../utils/cookies.js";

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    clearRefreshCookie(res);
    clearAccessCookie(res);
    const refreshHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({
      where: { refresh_token_hash: refreshHash },
    });

    if (!user) {
      clearAllAuthCookies(res);
      return res.status(403).json({
        status: "error",
        message: "Invalid refresh token",
      });
    }

    if (
      !user.refresh_expires_at ||
      new Date(user.refresh_expires_at) <= new Date()
    ) {
      await user.update({
        refresh_token_hash: null,
        refresh_expires_at: null,
        refresh_rotated_at: new Date(),
      });
      clearAllAuthCookies(res);
      return res.status(403).json({
        status: "error",
        message: "Refresh token expired",
      });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = generateRefreshToken();
    const newRefreshHash = hashRefreshToken(newRefreshToken);
    const newRefreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await user.update({
      refresh_token_hash: newRefreshHash,
      refresh_expires_at: newRefreshExpiresAt,
      refresh_rotated_at: new Date(),
    });

    setRefreshCookie(res, newRefreshToken);
    setAccessCookie(res, accessToken);

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    clearAllAuthCookies(res);
    return res.status(500).json({
      status: "error",
      message: "Token refresh failed",
    });
  }
};

const clearAllAuthCookies = (res) => {
  clearRefreshCookie(res);
  clearAccessCookie(res);
  clearCsrfCookie(res);
};
