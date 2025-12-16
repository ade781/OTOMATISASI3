const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models');

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS || 300);

// Middleware JWT + Session (5 menit) untuk melindungi semua endpoint privat
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Token tidak ditemukan.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    } catch (err) {
      return res.status(401).json({ message: 'Token tidak valid atau kedaluwarsa.' });
    }

    const session = await UserSession.findOne({
      where: {
        id: payload.sid,
        user_id: payload.sub,
        revoked: false
      }
    });

    if (!session) {
      return res.status(401).json({ message: 'Sesi tidak ditemukan.' });
    }

    const user = await User.findByPk(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan.' });
    }

    const remaining = new Date(session.session_expires_at).getTime() - Date.now();
    if (remaining < (SESSION_TTL_SECONDS * 1000) / 2) {
      await session.update({
        session_expires_at: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
        last_activity_at: new Date()
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
      sessionId: session.id
    };
    req.sessionRecord = session;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal memverifikasi sesi' });
  }
};
