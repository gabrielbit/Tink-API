const sequelize = require('../config/database');
const Organization = require('../models/Organization');

// Función para insertar datos de muestra
async function seedOrganizations() {
  try {
    // Sincronizar la base de datos
    await sequelize.sync({ force: false });
    
    // Verificar si ya existen organizaciones
    const count = await Organization.count();
    if (count > 0) {
      console.log('Ya existen organizaciones en la base de datos. No se insertarán datos de muestra.');
      return;
    }
    
    // Datos de muestra
    const organizations = [
      {
        name: 'Amnistía Internacional',
        description: 'Amnistía Internacional es un movimiento global de más de 10 millones de personas que se toman la injusticia como algo personal. Realizamos campañas para conseguir un mundo en el que todas las personas puedan disfrutar de sus derechos humanos.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Amnesty_International_logo.svg',
        responsibleName: 'Mariana Rodríguez',
        responsibleEmail: 'contacto@amnistia.org.ar',
        responsiblePhone: '+54 11 4811-6469',
        instagramUrl: 'https://www.instagram.com/amnistiaar',
        facebookUrl: 'https://www.facebook.com/amnistia.argentina',
        websiteUrl: 'https://amnistia.org.ar'
      },
      {
        name: 'UNICEF Argentina',
        description: 'UNICEF trabaja en Argentina para promover la protección de los derechos de niños, niñas y adolescentes, ayudando a satisfacer sus necesidades básicas y ampliando sus oportunidades a fin de que alcancen su pleno potencial.',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/UNICEF_logo.svg/1200px-UNICEF_logo.svg.png',
        responsibleName: 'Luisa Brumana',
        responsibleEmail: 'buenosaires@unicef.org',
        responsiblePhone: '+54 11 5789-9100',
        instagramUrl: 'https://www.instagram.com/unicefargentina',
        facebookUrl: 'https://www.facebook.com/UNICEFArgentina',
        websiteUrl: 'https://www.unicef.org/argentina'
      },
      {
        name: 'Banco de Bosques',
        description: 'Banco de Bosques es una fundación argentina que trabaja para detener la deforestación y proteger los bosques nativos a través de la compra de tierras y la creación de reservas naturales.',
        logo: 'https://www.bancodebosques.org/assets/imgs/logo-banco-de-bosques.png',
        responsibleName: 'Emiliano Ezcurra',
        responsibleEmail: 'info@bancodebosques.org',
        responsiblePhone: '+54 11 4783-8577',
        instagramUrl: 'https://www.instagram.com/bancodebosques',
        facebookUrl: 'https://www.facebook.com/bancodebosques',
        websiteUrl: 'https://www.bancodebosques.org'
      }
    ];
    
    // Insertar las organizaciones
    await Organization.bulkCreate(organizations);
    
    console.log('Datos de muestra insertados correctamente.');
  } catch (error) {
    console.error('Error al insertar datos de muestra:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
seedOrganizations(); 