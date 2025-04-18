const fs = require('fs');
const path = require('path');
const { Organization } = require('../models/associations');

// Imágenes de ejemplo para cada organización
const sampleImages = {
  'Amnistía Internacional': 'amnistia.jpg',
  'UNICEF Argentina': 'unicef.jpg',
  'Banco de Bosques': 'banco-bosques.jpg',
  'ONG de Prueba PostgreSQL': 'ong-test.jpg'
};

// Función para copiar una imagen al directorio de uploads y actualizar la organización
async function copyImageAndUpdate(orgName, imageName) {
  try {
    // Rutas de origen y destino
    const sourcePath = path.join(__dirname, 'sample-images', imageName);
    const uploadsDir = path.join(__dirname, '../public/uploads/organizations');
    
    // Crear directorio de destino si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Nombre único para la imagen
    const uniqueImageName = `org-${Date.now()}-${imageName}`;
    const destPath = path.join(uploadsDir, uniqueImageName);
    
    // Crear imágenes de prueba si no existen
    if (!fs.existsSync(sourcePath)) {
      // Crear una imagen de color sólido como ejemplo
      fs.writeFileSync(sourcePath, 'Esta sería una imagen real. Este es solo un placeholder para pruebas.');
    }
    
    // Copiar la imagen
    fs.copyFileSync(sourcePath, destPath);
    
    // Actualizar la organización en la base de datos
    const organization = await Organization.findOne({
      where: { name: orgName }
    });
    
    if (organization) {
      await organization.update({
        mainImage: uniqueImageName
      });
      console.log(`Imagen actualizada para ${orgName}: ${uniqueImageName}`);
    } else {
      console.log(`Organización no encontrada: ${orgName}`);
    }
    
    return uniqueImageName;
  } catch (error) {
    console.error(`Error al procesar imagen para ${orgName}:`, error);
    return null;
  }
}

// Función principal para actualizar las imágenes de todas las organizaciones
async function addImagesToOrganizations() {
  try {
    console.log('Iniciando proceso de actualización de imágenes...');
    
    // Procesar cada par organización-imagen
    for (const [orgName, imageName] of Object.entries(sampleImages)) {
      await copyImageAndUpdate(orgName, imageName);
    }
    
    console.log('Proceso de actualización de imágenes completado.');
  } catch (error) {
    console.error('Error durante la actualización de imágenes:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la función
addImagesToOrganizations(); 