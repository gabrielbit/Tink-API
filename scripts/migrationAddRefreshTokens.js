const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function createRefreshTokensTable() {
  try {
    await sequelize.getQueryInterface().createTable('refresh_tokens', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      isRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    console.log('Tabla refresh_tokens creada correctamente');
  } catch (error) {
    console.error('Error al crear la tabla refresh_tokens:', error);
  } finally {
    await sequelize.close();
  }
}

createRefreshTokensTable(); 