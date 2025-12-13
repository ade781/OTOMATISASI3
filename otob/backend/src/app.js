const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');

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

dotenv.config();

const app = express();
const uploadsBaseDir =
  process.env.UPLOADS_DIR || (process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '..', 'uploads'));

app.use(cors());
app.use(
  express.json({
    limit: '25mb'
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

// Static files untuk bukti dukung laporan uji akses
app.use('/uploads', express.static(uploadsBaseDir));

// Modul Laporan Uji Akses
app.use('/api/reports', ujiAksesReportRoutes);
app.use('/api/admin/reports', adminUjiAksesReportRoutes);

module.exports = app;
