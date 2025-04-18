const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function dropOldTables() {
  try {
    console.log('Eliminando tablas con nombres en mayúsculas...');
    
    // Eliminar tablas antiguas
    await sequelize.query('DROP TABLE IF EXISTS "Organizations" CASCADE');
    await sequelize.query('DROP TABLE IF EXISTS "Users" CASCADE');
    
    // Verificar que se eliminaron
    const tables = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
      { type: QueryTypes.SELECT }
    );
    
    console.log('Tablas restantes en la base de datos:');
    tables.forEach(t => console.log(`- ${t.tablename}`));
    
    console.log('Tablas con nombres en mayúsculas eliminadas correctamente.');
  } catch (error) {
    console.error('Error al eliminar tablas antiguas:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
dropOldTables(); 