const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Project = require('./Project');
const Donation = require('./Donation');
const User = require('./User');

const ProjectDonation = sequelize.define('ProjectDonation', {
  project_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  donation_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'donations',
      key: 'id'
    }
  },
  perc_of_total_ammount: {
    type: DataTypes.FLOAT
  },
  value_of_total_ammount: {
    type: DataTypes.FLOAT
  },
  user_id: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'project_donations',
  underscored: true,
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Relaciones
Project.belongsToMany(Donation, { 
  through: ProjectDonation,
  foreignKey: 'project_id',
  otherKey: 'donation_id',
  as: 'donations'
});

Donation.belongsToMany(Project, {
  through: ProjectDonation,
  foreignKey: 'donation_id',
  otherKey: 'project_id',
  as: 'projects'
});

// Relación con el usuario que creó la donación a un proyecto específico
ProjectDonation.belongsTo(User, { foreignKey: 'user_id' });

module.exports = ProjectDonation; 