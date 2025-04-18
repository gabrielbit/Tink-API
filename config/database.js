const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración para PostgreSQL utilizando variables de entorno
const sequelize = new Sequelize(
  process.env.DB_NAME || 'tink',
  process.env.DB_USER || 'tink_user',
  process.env.DB_PASSWORD || 'tinkpass',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize; 