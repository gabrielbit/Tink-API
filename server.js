const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
// Importar asociaciones
require('./models/associations');

const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const projectRoutes = require('./routes/projectRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const testRoutes = require('./routes/testRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Middleware
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Configurar servicio de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/test', testRoutes);
app.use('/api/images', imageRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Función para crear datos de muestra si no existen
const seedInitialData = async () => {
  try {
    // Importar modelos
    const Organization = require('./models/Organization');
    const User = require('./models/User');
    const Category = require('./models/Category');
    const Project = require('./models/Project');
    
    // Verificar si ya existen datos
    const orgCount = await Organization.count();
    const userCount = await User.count();
    const categoryCount = await Category.count();
    const projectCount = await Project.count();
    
    // Si no hay organizaciones, insertar datos de muestra
    if (orgCount === 0) {
      console.log('Insertando organizaciones de muestra...');
      
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
      
      await Organization.bulkCreate(organizations);
      console.log('Organizaciones de muestra insertadas correctamente');
    }
    
    // Si no hay usuarios, crear un usuario de admin
    if (userCount === 0) {
      console.log('Creando usuario administrador...');
      
      await User.create({
        name: 'Administrador',
        email: 'admin@tink.com',
        password: 'admin123'
      });
      
      console.log('Usuario administrador creado correctamente');
      console.log('Email: admin@tink.com');
      console.log('Contraseña: admin123');
    }
    
    // Si no hay categorías, insertar las categorías solicitadas
    if (categoryCount === 0) {
      console.log('Insertando categorías de muestra...');
      
      const categories = [
        { name: 'Pobreza', description: 'Proyectos enfocados en reducir la pobreza y mejorar condiciones de vida' },
        { name: 'Niñez', description: 'Proyectos que trabajan por el bienestar de niños y adolescentes' },
        { name: 'Medioambiente', description: 'Proyectos de conservación y protección del medioambiente' },
        { name: 'Animales', description: 'Proyectos de protección y bienestar animal' },
        { name: 'Educación', description: 'Proyectos enfocados en mejorar el acceso y calidad de la educación' },
        { name: 'Salud', description: 'Proyectos relacionados con la salud y el bienestar físico y mental' }
      ];
      
      await Category.bulkCreate(categories);
      console.log('Categorías de muestra insertadas correctamente');
    }
    
    // Si no hay proyectos, insertar algunos proyectos de muestra
    if (projectCount === 0 && orgCount > 0 && categoryCount > 0) {
      console.log('Insertando proyectos de muestra...');
      
      // Obtener IDs de organizaciones y categorías
      const organizations = await Organization.findAll();
      const categories = await Category.findAll();
      
      const organizationIds = organizations.map(org => org.id);
      const categoryIds = categories.map(cat => cat.id);
      
      // Crear proyectos de muestra
      const projects = [
        {
          title: 'Agua limpia para todos',
          description: 'Proyecto para proveer acceso a agua potable en comunidades vulnerables',
          startDate: new Date('2023-01-01'),
          endDate: new Date('2023-12-31'),
          maxAmount: 50000,
          country: 'Argentina',
          city: 'Buenos Aires',
          expectedImpact: 'Mejorar la calidad de vida de 1000 familias proporcionando acceso a agua potable',
          organizationId: organizationIds[0]
        },
        {
          title: 'Educación para el futuro',
          description: 'Programa de becas para niños y adolescentes en situación de vulnerabilidad',
          startDate: new Date('2023-03-15'),
          endDate: new Date('2024-03-14'),
          maxAmount: 75000,
          country: 'Argentina',
          city: 'Córdoba',
          expectedImpact: 'Proporcionar educación de calidad a 200 niños y adolescentes',
          organizationId: organizationIds[1]
        },
        {
          title: 'Reforestación del bosque nativo',
          description: 'Proyecto para reforestar áreas degradadas con especies nativas',
          startDate: new Date('2023-05-01'),
          endDate: null,
          maxAmount: 30000,
          country: 'Argentina',
          city: 'Misiones',
          expectedImpact: 'Reforestar 100 hectáreas de bosque nativo',
          organizationId: organizationIds[2]
        }
      ];
      
      // Crear los proyectos
      const createdProjects = await Project.bulkCreate(projects);
      
      // Asociar categorías a los proyectos
      await Promise.all([
        createdProjects[0].setCategories([
          categories.find(c => c.name === 'Pobreza'),
          categories.find(c => c.name === 'Salud')
        ]),
        createdProjects[1].setCategories([
          categories.find(c => c.name === 'Niñez'),
          categories.find(c => c.name === 'Educación')
        ]),
        createdProjects[2].setCategories([
          categories.find(c => c.name === 'Medioambiente'),
          categories.find(c => c.name === 'Animales')
        ])
      ]);
      
      console.log('Proyectos de muestra insertados correctamente');
    }
  } catch (error) {
    console.error('Error al crear datos iniciales:', error);
  }
};

// Sincronizar base de datos y iniciar servidor
sequelize.sync({ force: false, alter: true }).then(async () => {
  console.log('Base de datos PostgreSQL sincronizada');
  
  // Verificar e insertar datos iniciales si es necesario
  await seedInitialData();
  
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    console.log(`Conectado a la base de datos PostgreSQL: ${process.env.DB_NAME || 'tink'}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
}); 