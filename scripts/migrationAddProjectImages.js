const sequelize = require('../config/database');
const Project = require('../models/Project');
const Image = require('../models/Image');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// URLs de las imágenes
const MAIN_IMAGE_URL = 'https://www.graceindia.in/wp-content/uploads/2023/01/Resident-Social-Work-5.jpg';
const SECONDARY_IMAGE_URL = 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg';

// Función para descargar una imagen
async function downloadImage(url, filename) {
  try {
    // Asegurarse de que el directorio de uploads existe
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Ruta donde se guardará la imagen
    const filepath = path.join(uploadDir, filename);
    
    // Descargar la imagen
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    // Guardar la imagen en disco
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Imagen descargada como ${filename}`);
        resolve({
          filename,
          path: filepath,
          size: fs.statSync(filepath).size
        });
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error descargando la imagen desde ${url}:`, error);
    throw error;
  }
}

async function addProjectImages() {
  try {
    await sequelize.authenticate();
    console.log('Conexión establecida correctamente.');

    // Obtener todos los proyectos
    const projects = await Project.findAll();
    
    if (projects.length === 0) {
      console.log('No se encontraron proyectos. Por favor ejecute primero la migración de datos iniciales.');
      return;
    }

    console.log(`Encontrados ${projects.length} proyectos. Agregando imágenes...`);
    
    // Descargar las imágenes
    const mainImageExt = path.extname(new URL(MAIN_IMAGE_URL).pathname) || '.jpg';
    const secondaryImageExt = path.extname(new URL(SECONDARY_IMAGE_URL).pathname) || '.jpg';
    
    const mainImageFilename = `main_project_image_${Date.now()}${mainImageExt}`;
    const secondaryImageFilename = `secondary_project_image_${Date.now()}${secondaryImageExt}`;
    
    const mainImage = await downloadImage(MAIN_IMAGE_URL, mainImageFilename);
    const secondaryImage = await downloadImage(SECONDARY_IMAGE_URL, secondaryImageFilename);
    
    // Para cada proyecto, asociar las imágenes
    for (const project of projects) {
      console.log(`Procesando proyecto: ${project.title} (${project.id})`);
      
      // Crear registro para la imagen principal
      await Image.create({
        id: uuidv4(),
        entity_id: project.id,
        entity_type: 'project',
        filename: mainImage.filename,
        path: mainImage.path,
        size: mainImage.size,
        mimetype: `image/${mainImageExt.substring(1)}`,
        is_main: true
      });
      
      // Crear registro para la imagen secundaria
      await Image.create({
        id: uuidv4(),
        entity_id: project.id,
        entity_type: 'project',
        filename: secondaryImage.filename,
        path: secondaryImage.path,
        size: secondaryImage.size,
        mimetype: `image/${secondaryImageExt.substring(1)}`,
        is_main: false
      });
      
      console.log(`Se han añadido 2 imágenes al proyecto ${project.title}`);
    }
    
    console.log('Proceso completado exitosamente.');
  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la migración
addProjectImages(); 