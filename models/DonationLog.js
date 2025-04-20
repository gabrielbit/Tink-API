const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Donation = require('./Donation');
const User = require('./User');
const Project = require('./Project');
const Organization = require('./Organization');

const DonationLog = sequelize.define('DonationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  donation_id: {
    type: DataTypes.UUID,
    references: {
      model: 'donations',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  project_id: {
    type: DataTypes.UUID,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  organizations_id: {
    type: DataTypes.UUID,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  donation_date: {
    type: DataTypes.DATE
  },
  amount: {
    type: DataTypes.FLOAT
  },
  perc_of_total_ammount: {
    type: DataTypes.FLOAT
  },
  user_name: {
    type: DataTypes.TEXT
  },
  user_email: {
    type: DataTypes.TEXT
  },
  project_name: {
    type: DataTypes.TEXT
  },
  organizations_name: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'donation_log',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Relaciones
DonationLog.belongsTo(Donation, { foreignKey: 'donation_id' });
Donation.hasMany(DonationLog, { foreignKey: 'donation_id' });

DonationLog.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(DonationLog, { foreignKey: 'user_id' });

DonationLog.belongsTo(Project, { foreignKey: 'project_id' });
Project.hasMany(DonationLog, { foreignKey: 'project_id' });

DonationLog.belongsTo(Organization, { foreignKey: 'organizations_id' });
Organization.hasMany(DonationLog, { foreignKey: 'organizations_id' });

module.exports = DonationLog; 