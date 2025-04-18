const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

async function migrateTableNames() {
  try {
    console.log('Iniciando migración de nombres de tablas a minúsculas...');
    
    // Verificar si las tablas con mayúsculas existen
    const tables = await sequelize.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public'",
      { type: QueryTypes.SELECT }
    );
    
    const tableNames = tables.map(t => t.tablename);
    console.log('Tablas existentes:', tableNames);
    
    // Verificar si las tablas con mayúsculas existen
    const hasOrganizations = tableNames.includes('Organizations');
    const hasUsers = tableNames.includes('Users');
    
    // Crear nuevas tablas y mover datos si es necesario
    if (hasOrganizations) {
      console.log('Migrando datos de Organizations a organizations...');
      
      // Crear la tabla organizations si no existe
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT NOT NULL,
          logo VARCHAR(255),
          "responsibleName" VARCHAR(255) NOT NULL,
          "responsibleEmail" VARCHAR(255) NOT NULL,
          "responsiblePhone" VARCHAR(255),
          "instagramUrl" VARCHAR(255),
          "facebookUrl" VARCHAR(255),
          "websiteUrl" VARCHAR(255),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `);
      
      // Transferir datos
      await sequelize.query(`
        INSERT INTO organizations
        SELECT * FROM "Organizations"
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Verificar cuántos registros se movieron
      const orgCount = await sequelize.query(
        'SELECT COUNT(*) AS count FROM organizations',
        { type: QueryTypes.SELECT }
      );
      
      console.log(`Se migraron ${orgCount[0].count} registros a la tabla organizations`);
    }
    
    if (hasUsers) {
      console.log('Migrando datos de Users a users...');
      
      // Crear la tabla users si no existe
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        )
      `);
      
      // Transferir datos
      await sequelize.query(`
        INSERT INTO users
        SELECT * FROM "Users"
        ON CONFLICT (id) DO NOTHING
      `);
      
      // Verificar cuántos registros se movieron
      const userCount = await sequelize.query(
        'SELECT COUNT(*) AS count FROM users',
        { type: QueryTypes.SELECT }
      );
      
      console.log(`Se migraron ${userCount[0].count} registros a la tabla users`);
    }
    
    console.log('Migración completa a nombres de tablas en minúsculas.');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la migración
migrateTableNames(); 