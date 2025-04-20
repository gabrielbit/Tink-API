const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Organization = require('./Organization');
const Project = require('./Project');

const Image = sequelize.define('Image', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false,
    comment: 'ID de la entidad asociada (proyecto u organización)'
  },
  entity_type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Tipo de entidad: project u organization'
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER
  },
  mimetype: {
    type: DataTypes.STRING
  },
  is_main: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indica si esta imagen es la principal para la entidad'
  }
}, {
  tableName: 'images',
  underscored: true,
  timestamps: true,
  paranoid: true
});

// Métodos de asociación
Image.associate = function() {
  // Método para obtener todas las imágenes de una organización
  Image.getOrganizationImages = async function(organizationId) {
    return await this.findAll({
      where: {
        entity_id: organizationId,
        entity_type: 'organization'
      }
    });
  };

  // Método para obtener todas las imágenes de un proyecto
  Image.getProjectImages = async function(projectId) {
    return await this.findAll({
      where: {
        entity_id: projectId,
        entity_type: 'project'
      }
    });
  };

  // Método para obtener la imagen principal de una entidad
  Image.getMainImage = async function(entityId, entityType) {
    return await this.findOne({
      where: {
        entity_id: entityId,
        entity_type: entityType,
        is_main: true
      }
    });
  };
};

// Ejecutar la función de asociación
Image.associate();

module.exports = Image; 