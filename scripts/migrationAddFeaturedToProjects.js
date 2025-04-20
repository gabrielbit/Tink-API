const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function addFeaturedToProjects() {
  try {
    await sequelize.getQueryInterface().addColumn('projects', 'featured', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    console.log('Campo "featured" agregado correctamente a la tabla projects');
  } catch (error) {
    console.error('Error al agregar el campo "featured":', error);
  } finally {
    await sequelize.close();
  }
}

addFeaturedToProjects(); 