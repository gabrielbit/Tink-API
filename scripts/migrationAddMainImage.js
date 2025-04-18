const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function migrationAddMainImage() {
  try {
    console.log('Iniciando migración para agregar la columna mainImage...');
    
    // Agregar la columna mainImage a la tabla organizations
    await sequelize.query(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS "mainImage" VARCHAR(255);
    `);
    
    console.log('Columna mainImage agregada correctamente a la tabla organizations');
    
    // Verificar que la columna se haya agregado
    const tables = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'organizations'",
      { type: QueryTypes.SELECT }
    );
    
    console.log('Columnas en la tabla organizations:');
    tables.forEach(col => console.log(`- ${col.column_name}`));
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la migración
migrationAddMainImage(); 