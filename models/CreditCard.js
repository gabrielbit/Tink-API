const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const CreditCard = sequelize.define('CreditCard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  number: {
    type: DataTypes.TEXT
  },
  cbu: {
    type: DataTypes.TEXT
  },
  country: {
    type: DataTypes.TEXT
  },
  holder: {
    type: DataTypes.INTEGER,
    comment: '1: VISA; 2: MasterCard; 3: AMEX; 4: Cabal'
  },
  type: {
    type: DataTypes.INTEGER,
    comment: '1: Credit; 2: Debit'
  },
  end_date: {
    type: DataTypes.DATE
  },
  code: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'credit_card',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Relación con el usuario
CreditCard.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(CreditCard, { foreignKey: 'user_id' });

module.exports = CreditCard; 