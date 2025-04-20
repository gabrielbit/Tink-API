const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');
const SocialNetworkType = require('../models/SocialNetworkType');

async function createSocialNetworkTypes() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Definir los tipos de redes sociales predeterminados
    const defaultTypes = [
      {
        id: uuidv4(),
        name: 'Facebook',
        url: 'https://facebook.com/',
        icon: 'facebook'
      },
      {
        id: uuidv4(),
        name: 'Twitter',
        url: 'https://twitter.com/',
        icon: 'twitter'
      },
      {
        id: uuidv4(),
        name: 'Instagram',
        url: 'https://instagram.com/',
        icon: 'instagram'
      },
      {
        id: uuidv4(),
        name: 'LinkedIn',
        url: 'https://linkedin.com/company/',
        icon: 'linkedin'
      },
      {
        id: uuidv4(),
        name: 'YouTube',
        url: 'https://youtube.com/',
        icon: 'youtube'
      },
      {
        id: uuidv4(),
        name: 'TikTok',
        url: 'https://tiktok.com/@',
        icon: 'tiktok'
      }
    ];

    // Sincronizar el modelo con la base de datos
    await SocialNetworkType.sync();

    // Insertar los tipos predeterminados
    for (const type of defaultTypes) {
      const [record, created] = await SocialNetworkType.findOrCreate({
        where: { name: type.name },
        defaults: type
      });

      if (created) {
        console.log(`Tipo de red social creado: ${type.name}`);
      } else {
        console.log(`El tipo de red social ${type.name} ya existe.`);
      }
    }

    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    // Cerrar la conexión
    await sequelize.close();
  }
}

// Ejecutar la migración
createSocialNetworkTypes(); 