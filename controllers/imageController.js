const Image = require('../models/Image');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Función auxiliar para validar la entidad
const validateEntity = async (entityId, entityType) => {
  try {
    let entity;
    
    if (entityType === 'organization') {
      entity = await Organization.findByPk(entityId);
    } else if (entityType === 'project') {
      entity = await Project.findByPk(entityId);
    }
    
    if (!entity) {
      throw new Error(`${entityType} con ID ${entityId} no encontrado`);
    }
    
    return entity;
  } catch (error) {
    throw error;
  }
};

// Subir una imagen
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen' });
    }

    const { entityId, entityType, isMain } = req.body;
    
    if (!entityId || !entityType) {
      return res.status(400).json({ message: 'Se requiere ID y tipo de entidad' });
    }
    
    // Validar que la entidad existe
    await validateEntity(entityId, entityType);
    
    // Si la imagen se marca como principal, actualizar las demás para que no sean principales
    if (isMain === 'true' || isMain === true) {
      await Image.update(
        { is_main: false },
        { where: { entity_id: entityId, entity_type: entityType } }
      );
    }
    
    // Crear el registro de la imagen
    const image = await Image.create({
      entity_id: entityId,
      entity_type: entityType,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      is_main: isMain === 'true' || isMain === true
    });
    
    return res.status(201).json({
      message: 'Imagen subida correctamente',
      image
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return res.status(500).json({ message: 'Error al subir la imagen', error: error.message });
  }
};

// Obtener todas las imágenes para una entidad
exports.getEntityImages = async (req, res) => {
  try {
    const { entityId, entityType } = req.params;
    
    if (!entityId || !entityType) {
      return res.status(400).json({ message: 'Se requiere ID y tipo de entidad' });
    }
    
    // Validar que la entidad existe
    await validateEntity(entityId, entityType);
    
    // Buscar imágenes
    const images = await Image.findAll({
      where: {
        entity_id: entityId,
        entity_type: entityType
      }
    });
    
    // Agregar URL completa a cada imagen
    const imagesWithUrl = images.map(img => {
      const imageData = img.toJSON();
      imageData.url = `/static/uploads/${img.filename}`;
      return imageData;
    });
    
    return res.status(200).json(imagesWithUrl);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    return res.status(500).json({ message: 'Error al obtener las imágenes', error: error.message });
  }
};

// Obtener la imagen principal de una entidad
exports.getMainImage = async (req, res) => {
  try {
    const { entityId, entityType } = req.params;
    
    if (!entityId || !entityType) {
      return res.status(400).json({ message: 'Se requiere ID y tipo de entidad' });
    }
    
    // Validar que la entidad existe
    await validateEntity(entityId, entityType);
    
    // Buscar imagen principal
    const image = await Image.findOne({
      where: {
        entity_id: entityId,
        entity_type: entityType,
        is_main: true
      }
    });
    
    if (!image) {
      return res.status(404).json({ message: 'No se encontró imagen principal' });
    }
    
    const imageData = image.toJSON();
    imageData.url = `/static/uploads/${image.filename}`;
    
    return res.status(200).json(imageData);
  } catch (error) {
    console.error('Error al obtener imagen principal:', error);
    return res.status(500).json({ message: 'Error al obtener la imagen principal', error: error.message });
  }
};

// Establecer una imagen como principal
exports.setMainImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Buscar la imagen
    const image = await Image.findByPk(imageId);
    
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    
    // Actualizar todas las imágenes de la entidad para que no sean principales
    await Image.update(
      { is_main: false },
      { 
        where: { 
          entity_id: image.entity_id, 
          entity_type: image.entity_type 
        } 
      }
    );
    
    // Establecer esta imagen como principal
    await image.update({ is_main: true });
    
    return res.status(200).json({
      message: 'Imagen establecida como principal',
      image
    });
  } catch (error) {
    console.error('Error al establecer imagen principal:', error);
    return res.status(500).json({ message: 'Error al establecer imagen principal', error: error.message });
  }
};

// Eliminar una imagen
exports.deleteImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Buscar la imagen
    const image = await Image.findByPk(imageId);
    
    if (!image) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    
    // Eliminar el archivo físico
    const filePath = image.path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Eliminar el registro
    await image.destroy();
    
    return res.status(200).json({
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return res.status(500).json({ message: 'Error al eliminar la imagen', error: error.message });
  }
}; 