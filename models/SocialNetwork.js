const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const SocialNetworkType = require('./SocialNetworkType');

const SocialNetwork = sequelize.define('SocialNetwork', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  organization_id: {
    type: DataTypes.UUID,
    references: {
      model: 'organizations',
      key: 'id'
    },
    allowNull: false
  },
  social_network_type_id: {
    type: DataTypes.UUID,
    references: {
      model: 'social_networks_types',
      key: 'id'
    },
    allowNull: false
  },
  username: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'social_networks',
  underscored: true,
  timestamps: true,
  paranoid: true
});

// Definir relaciones
SocialNetwork.belongsTo(Organization, { foreignKey: 'organization_id' });
Organization.hasMany(SocialNetwork, { foreignKey: 'organization_id' });

SocialNetwork.belongsTo(SocialNetworkType, { foreignKey: 'social_network_type_id' });
SocialNetworkType.hasMany(SocialNetwork, { foreignKey: 'social_network_type_id' });

module.exports = SocialNetwork; 