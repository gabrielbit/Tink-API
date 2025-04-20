const sequelize = require('../config/database');
// Importar asociaciones
require('../models/associations');
const Project = require('../models/Project');
const Image = require('../models/Image');
const Organization = require('../models/Organization');
const Category = require('../models/Category');
const { v4: uuidv4 } = require('uuid');

// Función auxiliar para agregar URLs a las imágenes
const addImageUrls = (images) => {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map(img => {
    const imageData = img.toJSON ? img.toJSON() : img;
    imageData.url = `/uploads/${imageData.filename}`;
    return imageData;
  });
};

// Prueba principal
async function testImageAssociation() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');
    
    // Obtener el primer proyecto
    const projects = await Project.findAll({ limit: 1 });
    
    if (projects.length === 0) {
      console.log('No se encontraron proyectos');
      return;
    }
    
    const project = projects[0];
    console.log(`Proyecto encontrado: ${project.title} (${project.id})`);
    
    // Buscar el proyecto con sus relaciones
    const projectWithRelations = await Project.findByPk(project.id, {
      include: [
        { model: Category, as: 'categories' },
        { model: Organization, as: 'organization' }
      ]
    });
    
    // Obtener imágenes asociadas
    const images = await projectWithRelations.getImages();
    console.log(`Encontradas ${images.length} imágenes para el proyecto`);
    
    // Crear respuesta
    const projectData = projectWithRelations.toJSON();
    projectData.images = addImageUrls(images);
    
    // Obtener imagen principal
    const mainImage = images.find(img => img.is_main === true);
    if (mainImage) {
      projectData.mainImageUrl = `/uploads/${mainImage.filename}`;
      console.log(`Imagen principal encontrada: ${mainImage.filename}`);
    }
    
    console.log('Proyecto con sus imágenes:');
    console.log(JSON.stringify(projectData, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la prueba
testImageAssociation(); 