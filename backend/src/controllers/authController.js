import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import {
  generateRefreshToken,
  hashRefreshToken,
  generateCsrfToken,
} from "../utils/tokens.js";
import {
  setRefreshCookie,
  clearRefreshCookie,
  setAccessCookie,
  clearAccessCookie,
  setCsrfCookie,
  clearCsrfCookie,
} from "../utils/cookies.js";

const csrf = async (req, res) => {
  try {
    // Tolak permintaan CSRF jika user belum terautentikasi
    if (!req.user && !req.cookies?.refreshToken && !req.cookies?.accessToken) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Unauthorized' 
      });
    }

    // Jika cookie csrfToken sudah ada, kembalikan yang sama (jangan rotate)
    const existing = req.cookies?.csrfToken;
    if (existing) {
      return res.status(200).json({ csrfToken: existing });
    }else {
    const token = await generateCsrfToken();
    setCsrfCookie(res, token);
    return res.status(200).json({ csrfToken: token });
    }
  } catch (error) {
    console.error('CSRF generation error:', error);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to generate CSRF token' 
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ 
        status: "Failed", 
        message: "Username atau password salah" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        status: "Failed", 
        message: "Username atau password salah" 
      });
    }

    const userPlain = user.toJSON();
    const {
      password: _p,
      refresh_token: _rt,
      refresh_token_hash: _rh,
      refresh_expires_at: _re,
      ...safeUserData
    } = userPlain;

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = generateRefreshToken();
    const refreshHash = hashRefreshToken(refreshToken);
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await user.update({
      refresh_token_hash: refreshHash,
      refresh_expires_at: refreshExpiresAt,
      refresh_rotated_at: new Date(),
    });

    const csrfToken = await generateCsrfToken();

    setRefreshCookie(res, refreshToken);
    setAccessCookie(res, accessToken);
    setCsrfCookie(res, csrfToken);

    return res.status(200).json({
      status: "Success",
      message: "Login berhasil",
      user: safeUserData,
      csrfToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      status: "error", 
      message: "Internal server error" 
    });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    clearRefreshCookie(res);
    clearAccessCookie(res);
    clearCsrfCookie(res);

    if (!refreshToken) {
      return res.status(200).json({ 
        status: 'success',
        message: "Logged out successfully" 
      });
    }

    const refreshHash = hashRefreshToken(refreshToken);
    
    await User.update(
      {
        refresh_token_hash: null,
        refresh_expires_at: null,
        refresh_rotated_at: new Date(),
      },
      {
        where: { refresh_token_hash: refreshHash },
      }
    );

    return res.status(200).json({ 
      status: 'success',
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      status: 'error',
      message: 'Logout failed' 
    });
  }
};

export { login, logout, csrf };
