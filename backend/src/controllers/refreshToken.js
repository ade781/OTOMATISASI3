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

const ROTATION_GRACE_PERIOD_MS = 30000; // 30 detik untuk multi-tab / simultaneous refresh

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      clearAllAuthCookies(res);
      return res.status(401).json({
        status: "error",
        code: "REFRESH_TOKEN_MISSING",
        message: "Refresh token is missing",
      });
    }

    const refreshHash = hashRefreshToken(refreshToken);
    let user = await User.findOne({
      where: { refresh_token_hash: refreshHash },
    });

    let isGracePeriodReuse = false;
    // Pengecekan grace period jika token baru saja dirotasi oleh request lain / tab lain
    if (!user) {
      const graceUser = await User.findOne({
        where: { prev_refresh_token_hash: refreshHash },
      });

      if (
        graceUser &&
        graceUser.refresh_rotated_at &&
        Date.now() - new Date(graceUser.refresh_rotated_at).getTime() < ROTATION_GRACE_PERIOD_MS
      ) {
        user = graceUser;
        isGracePeriodReuse = true;
      }
    }

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
        prev_refresh_token_hash: null,
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

    if (isGracePeriodReuse) {
      // Jika dalam grace period, cukup perbarui accessToken tanpa membatalkan token yang sedang aktif
      setAccessCookie(res, accessToken);
      return res.json({ success: true, grace: true });
    }

    const newRefreshToken = generateRefreshToken();
    const newRefreshHash = hashRefreshToken(newRefreshToken);
    const newRefreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await user.update({
      prev_refresh_token_hash: user.refresh_token_hash,
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
