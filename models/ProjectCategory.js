const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectCategory = sequelize.define('ProjectCategory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'projects',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'project_categories',
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['projectId', 'categoryId']
    }
  ]
});

module.exports = ProjectCategory; 