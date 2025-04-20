const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImpactCategory = sequelize.define('ImpactCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'impact_categories',
  timestamps: false
});

module.exports = ImpactCategory; 