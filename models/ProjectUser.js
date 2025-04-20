const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');

const ProjectUser = sequelize.define('ProjectUser', {
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  project_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  is_owner: {
    type: DataTypes.INTEGER
  },
  category_id: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'project_users',
  timestamps: false
});

// Relaciones
User.belongsToMany(Project, { 
  through: ProjectUser,
  foreignKey: 'user_id',
  otherKey: 'project_id',
  as: 'projects'
});

Project.belongsToMany(User, {
  through: ProjectUser,
  foreignKey: 'project_id',
  otherKey: 'user_id',
  as: 'users'
});

module.exports = ProjectUser; 