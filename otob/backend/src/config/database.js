const { Sequelize } = require('sequelize');
const path = require('path');

// Pastikan bisa menemukan .env walau dijalankan dari folder lain (mis. `otob/`)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const buildPostgres = () =>
  new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    define: {
      underscored: true
    }
  });

const buildMysql = () =>
  new Sequelize(
    process.env.DB_NAME || 'oto2_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      dialect: 'mysql',
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      logging: false,
      define: {
        underscored: true
      }
    }
  );

const sequelize = process.env.DATABASE_URL ? buildPostgres() : buildMysql();

module.exports = sequelize;
