const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function createImageTable() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Crear la tabla de imágenes
    await sequelize.getQueryInterface().createTable('images', {
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
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      deleted_at: {
        type: DataTypes.DATE
      }
    });

    // Crear índices para mejorar el rendimiento de las consultas
    await sequelize.getQueryInterface().addIndex('images', ['entity_id', 'entity_type'], {
      name: 'idx_images_entity'
    });

    await sequelize.getQueryInterface().addIndex('images', ['entity_id', 'entity_type', 'is_main'], {
      name: 'idx_images_main'
    });

    console.log('Tabla de imágenes creada correctamente');
  } catch (error) {
    console.error('Error al crear la tabla de imágenes:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la migración
createImageTable(); 