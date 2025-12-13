const { Sequelize } = require('sequelize');
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

module.exports = sequelize;
