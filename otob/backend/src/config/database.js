const { Sequelize } = require('sequelize');
<<<<<<< HEAD
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
=======
require('dotenv').config();

// Gunakan connection string dari env variable DATABASE_URL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres', // Ganti ke postgres
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  },
  logging: false
});
>>>>>>> 020726c2893995478732cebf6d0d90a14768f723

module.exports = sequelize;
