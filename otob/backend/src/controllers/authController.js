const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { User, UserSession } = require('../models');

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 300);
const REFRESH_TTL_SECONDS = Number(process.env.REFRESH_TTL_SECONDS || 86400);

const sanitizeUser = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role
});

const signAccessToken = (user, sessionId) =>
  jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      sid: sessionId
    },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: `${SESSION_TTL_SECONDS}s` }
  );

const buildSessionExpiry = () => new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
const buildRefreshExpiry = () => new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: REFRESH_TTL_SECONDS * 1000
  });
};

const createSession = async (user, req) => {
  const sessionId = uuidv4();
  const refreshSecret = crypto.randomBytes(48).toString('hex');
  const hashedSecret = await bcrypt.hash(refreshSecret, 10);
  const session = await UserSession.create({
    id: sessionId,
    user_id: user.id,
    refresh_token_hash: hashedSecret,
    session_expires_at: buildSessionExpiry(),
    refresh_expires_at: buildRefreshExpiry(),
    user_agent: req.get('user-agent') || null,
    ip_address: req.ip,
    last_activity_at: new Date()
  });
  return {
    session,
    refreshToken: `${sessionId}.${refreshSecret}`
  };
};

const extractRefreshParts = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  return { sessionId: parts[0], secret: parts[1] };
};

const login = async (req, res) => {
  try {
    const usernameInput = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const passwordInput = typeof req.body.password === 'string' ? req.body.password : '';

    if (!usernameInput || !passwordInput) {
      return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    const user = await User.findOne({ where: { username: usernameInput } });
    if (!user) {
      return res.status(401).json({ message: 'Kredensial salah' });
    }

    let passwordMatch = user.password === passwordInput;
    if (!passwordMatch) {
      try {
        passwordMatch = await bcrypt.compare(passwordInput, user.password);
      } catch (err) {
        passwordMatch = false;
      }
    }

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Kredensial salah' });
    }

    const { session, refreshToken } = await createSession(user, req);
    const accessToken = signAccessToken(user, session.id);
    setRefreshCookie(res, refreshToken);

    return res.json({
      user: sanitizeUser(user),
      accessToken,
      expiresIn: SESSION_TTL_SECONDS
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
};

const refresh = async (req, res) => {
  try {
    const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
    const parts = extractRefreshParts(rawToken);

    if (!parts) {
      return res.status(401).json({ message: 'Refresh token tidak valid' });
    }

    const session = await UserSession.findOne({
      where: { id: parts.sessionId, revoked: false },
      include: [{ model: User, as: 'user' }]
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: 'Sesi tidak ditemukan' });
    }

    if (new Date(session.refresh_expires_at).getTime() < Date.now()) {
      await session.update({ revoked: true });
      return res.status(401).json({ message: 'Refresh token kedaluwarsa' });
    }

    if (new Date(session.session_expires_at).getTime() < Date.now()) {
      await session.update({ revoked: true });
      return res.status(401).json({ message: 'Sesi kedaluwarsa. Mohon login ulang.' });
    }

    const secretMatch = await bcrypt.compare(parts.secret, session.refresh_token_hash);
    if (!secretMatch) {
      await session.update({ revoked: true });
      return res.status(401).json({ message: 'Refresh token tidak valid' });
    }

    const newSecret = crypto.randomBytes(48).toString('hex');
    const newHash = await bcrypt.hash(newSecret, 10);
    await session.update({
      refresh_token_hash: newHash,
      session_expires_at: buildSessionExpiry(),
      refresh_expires_at: buildRefreshExpiry(),
      last_activity_at: new Date()
    });
    const newRefreshToken = `${session.id}.${newSecret}`;
    const accessToken = signAccessToken(session.user, session.id);

    setRefreshCookie(res, newRefreshToken);

    return res.json({
      user: sanitizeUser(session.user),
      accessToken,
      expiresIn: SESSION_TTL_SECONDS
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal memperbarui sesi' });
  }
};

const logout = async (req, res) => {
  try {
    if (req.sessionRecord) {
      await req.sessionRecord.update({
        revoked: true,
        session_expires_at: new Date(),
        refresh_expires_at: new Date()
      });
    } else {
      const rawToken = req.cookies?.refreshToken;
      const parts = extractRefreshParts(rawToken);
      if (parts) {
        await UserSession.update(
          { revoked: true },
          { where: { id: parts.sessionId } }
        );
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    });
    return res.json({ message: 'Berhasil keluar' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal logout' });
  }
};

module.exports = {
  login,
  refresh,
  logout
};
