const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const configRoutes = require('./routes/configRoutes');
const badanPublikRoutes = require('./routes/badanPublikRoutes');
const emailRoutes = require('./routes/emailRoutes');
const userRoutes = require('./routes/userRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const quotaRoutes = require('./routes/quotaRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const newsRoutes = require('./routes/newsRoutes');
const ujiAksesReportRoutes = require('./routes/ujiAksesReportRoutes');
const adminUjiAksesReportRoutes = require('./routes/adminUjiAksesReportRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cookieParser = require('cookie-parser');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.disable('x-powered-by');

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origin tidak diizinkan oleh CORS'));
      }
    },
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cookieParser());
app.use(
  express.json({
    limit: '25mb' // naikkan limit agar lampiran base64 tidak ditolak
  })
);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/config', configRoutes);
app.use('/badan-publik', badanPublikRoutes);
app.use('/email', emailRoutes);
app.use('/users', userRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/quota', quotaRoutes);
app.use('/holidays', holidayRoutes);
app.use('/news', newsRoutes);
app.use('/monitoring', monitoringRoutes);
app.use('/messages', messageRoutes);

// Static files untuk bukti dukung laporan uji akses
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Modul Laporan Uji Akses
app.use('/api/reports', ujiAksesReportRoutes);
app.use('/api/admin/reports', adminUjiAksesReportRoutes);

// Handler error terpusat termasuk CORS
app.use((err, _req, res, _next) => {
  if (err?.message && err.message.includes('Origin tidak diizinkan')) {
    return res.status(403).json({ message: 'Origin tidak diizinkan oleh server' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

// Bootstrapping server + koneksi database
const startServer = async () => {
  try {
    await sequelize.authenticate();
    // Gunakan alter agar kolom baru (message_id, attachments) otomatis ditambahkan
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server berjalan pada port ${PORT}`);
    });
  } catch (err) {
    console.error('Gagal konek database', err);
    process.exit(1);
  }
};

startServer();
