const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

async function migrateLogo() {
  try {
    // Agregar la columna logo a la tabla Organizations
    await sequelize.query(`
      ALTER TABLE "Organizations" 
      ADD COLUMN IF NOT EXISTS "logo" VARCHAR(255);
    `);
    
    console.log('Columna logo agregada correctamente a la tabla Organizations');
    
    // Opcional: Actualizar con datos de muestra
    await sequelize.query(`
      UPDATE "Organizations"
      SET "logo" = CASE
        WHEN "name" LIKE '%Amnistía%' THEN 'https://upload.wikimedia.org/wikipedia/commons/7/75/Amnesty_International_logo.svg'
        WHEN "name" LIKE '%UNICEF%' THEN 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/UNICEF_logo.svg/1200px-UNICEF_logo.svg.png'
        WHEN "name" LIKE '%Banco de Bosques%' THEN 'https://www.bancodebosques.org/assets/imgs/logo-banco-de-bosques.png'
        ELSE NULL
      END
      WHERE "logo" IS NULL;
    `);
    
    console.log('Datos de logo actualizados correctamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    process.exit();
  }
}

migrateLogo(); 