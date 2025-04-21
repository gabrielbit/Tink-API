const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

async function addColorToCategories() {
  try {
    await sequelize.getQueryInterface().addColumn('categories', 'color', {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#3498db'
    });

    console.log('Campo "color" agregado correctamente a la tabla categories');
  } catch (error) {
    console.error('Error al agregar el campo "color":', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  addColorToCategories()
    .then(() => {
      console.log('Migración completada');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error en la migración:', err);
      process.exit(1);
    });
}

module.exports = addColorToCategories; 