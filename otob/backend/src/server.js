const { sequelize } = require('./models');
const app = require('./app');
const PORT = process.env.PORT || 5000;

// Bootstrapping server + koneksi database (run lokal)
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

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
