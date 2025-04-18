const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function listTables() {
  try {
    const tables = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
      { type: QueryTypes.SELECT }
    );
    
    console.log('Tablas en la base de datos:');
    tables.forEach(t => console.log(`- ${t.tablename}`));
  } catch (error) {
    console.error('Error al listar tablas:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
listTables(); 