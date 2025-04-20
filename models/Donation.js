const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  start_date: {
    type: DataTypes.DATE
  },
  end_date: {
    type: DataTypes.DATE
  },
  is_recurrent: {
    type: DataTypes.INTEGER
  },
  frecuency: {
    type: DataTypes.INTEGER
  },
  total_amount: {
    type: DataTypes.FLOAT
  },
  auto_adjustment: {
    type: DataTypes.INTEGER,
    comment: '1: yes; 2: no; 3: call me'
  }
}, {
  tableName: 'donations',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Relación con el usuario
Donation.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Donation, { foreignKey: 'user_id' });

module.exports = Donation; 