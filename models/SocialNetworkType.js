const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialNetworkType = sequelize.define('SocialNetworkType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT
  },
  icon: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'social_networks_types',
  underscored: true,
  timestamps: true,
  paranoid: true
});

module.exports = SocialNetworkType; 