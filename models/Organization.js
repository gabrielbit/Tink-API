const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mainImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  responsibleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  responsibleEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  responsiblePhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  instagramUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  facebookUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  websiteUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'organizations',
  freezeTableName: true
});

module.exports = Organization; 