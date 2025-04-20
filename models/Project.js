const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  maxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expectedImpact: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  organizationId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'organizations',
      key: 'id'
    }
  },
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'projects',
  freezeTableName: true
});

// Método para obtener todas las imágenes del proyecto
Project.prototype.getImages = async function() {
  const Image = require('./Image');
  return await Image.getProjectImages(this.id);
};

// Método para obtener la imagen principal del proyecto
Project.prototype.getMainImage = async function() {
  const Image = require('./Image');
  return await Image.getMainImage(this.id, 'project');
};

module.exports = Project; 