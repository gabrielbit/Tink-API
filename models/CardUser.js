const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const CreditCard = require('./CreditCard');

const CardUser = sequelize.define('CardUser', {
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  card_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'credit_card',
      key: 'id'
    }
  },
  is_default: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'card_users',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Relaciones
User.belongsToMany(CreditCard, { 
  through: CardUser,
  foreignKey: 'user_id',
  otherKey: 'card_id',
  as: 'cards'
});

CreditCard.belongsToMany(User, {
  through: CardUser,
  foreignKey: 'card_id',
  otherKey: 'user_id',
  as: 'users'
});

module.exports = CardUser; 