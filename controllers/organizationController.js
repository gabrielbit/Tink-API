const Organization = require('../models/Organization');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Obtener todas las organizaciones
exports.getAllOrganizations = async (req, res) => {
  try {
    const { name, limit = 10, page = 1, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    // Construir el objeto de filtros
    const filters = {};
    
    if (name) {
      filters.name = { [Op.like]: `%${name}%` };
    }
    
    console.log('Ejecutando consulta con filtros:', filters);
    
    // Ejecutar consulta con filtros y ordenamiento
    const { count, rows: organizations } = await Organization.findAndCountAll({
      where: filters,
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    console.log(`Se encontraron ${count} organizaciones`);
    
    // Obtener imágenes para cada organización
    const organizationsWithImages = await Promise.all(
      organizations.map(async organization => {
        const orgData = organization.toJSON();
        
        // Agregar la URL completa para la imagen principal si existe
        if (orgData.mainImage) {
          orgData.mainImageUrl = `/uploads/organizations/${orgData.mainImage}`;
        }
        
        // Obtener y agregar todas las imágenes asociadas
        const images = await organization.getImages();
        orgData.images = addImageUrls(images);
        
        return orgData;
      })
    );
    
    return res.status(200).json({
      organizations: organizationsWithImages,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener organizaciones:', error);
    return res.status(500).json({ message: 'Error al obtener organizaciones', error: error.message });
  }
};

// Función auxiliar para agregar URLs a las imágenes
const addImageUrls = (images) => {
  if (!images || !Array.isArray(images)) return [];
  
  return images.map(img => {
    const imageData = img.toJSON ? img.toJSON() : img;
    imageData.url = `/uploads/${imageData.filename}`;
    return imageData;
  });
};

// Obtener una organización por ID
exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Obtener las imágenes asociadas
    const images = await organization.getImages();
    
    // Crear un objeto de respuesta con la información de la organización
    const organizationData = organization.toJSON();
    
    // Si hay una imagen principal, agregarla al objeto de respuesta
    if (organizationData.mainImage) {
      organizationData.mainImageUrl = `/uploads/organizations/${organizationData.mainImage}`;
    }
    
    // Agregar las imágenes al objeto de respuesta
    organizationData.images = addImageUrls(images);
    
    return res.status(200).json(organizationData);
  } catch (error) {
    console.error('Error al obtener la organización:', error);
    return res.status(500).json({ message: 'Error al obtener la organización', error: error.message });
  }
};

// Crear una nueva organización
exports.createOrganization = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      logo,
      responsibleName, 
      responsibleEmail, 
      responsiblePhone, 
      instagramUrl, 
      facebookUrl, 
      websiteUrl 
    } = req.body;
    
    // Validación básica
    if (!name || !description || !responsibleName || !responsibleEmail) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    
    // Manejar la imagen principal si se subió
    let mainImage = null;
    if (req.file) {
      mainImage = path.basename(req.file.path);
    }
    
    const newOrganization = await Organization.create({
      name,
      description,
      logo,
      mainImage,
      responsibleName,
      responsibleEmail,
      responsiblePhone,
      instagramUrl,
      facebookUrl,
      websiteUrl
    });
    
    return res.status(201).json(newOrganization);
  } catch (error) {
    console.error('Error al crear la organización:', error);
    return res.status(500).json({ message: 'Error al crear la organización' });
  }
};

// Actualizar una organización
exports.updateOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    const {
      name,
      description,
      logo,
      responsibleName,
      responsibleEmail,
      responsiblePhone,
      instagramUrl,
      facebookUrl,
      websiteUrl
    } = req.body;
    
    // Manejar la imagen principal si se subió una nueva
    let mainImage = organization.mainImage;
    if (req.file) {
      // Eliminar la imagen anterior si existe
      if (organization.mainImage) {
        const oldImagePath = path.join(__dirname, '../public/uploads/organizations', organization.mainImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      mainImage = path.basename(req.file.path);
    }
    
    await organization.update({
      name: name || organization.name,
      description: description || organization.description,
      logo: logo || organization.logo,
      mainImage,
      responsibleName: responsibleName || organization.responsibleName,
      responsibleEmail: responsibleEmail || organization.responsibleEmail,
      responsiblePhone: responsiblePhone || organization.responsiblePhone,
      instagramUrl: instagramUrl || organization.instagramUrl,
      facebookUrl: facebookUrl || organization.facebookUrl,
      websiteUrl: websiteUrl || organization.websiteUrl
    });
    
    return res.status(200).json(organization);
  } catch (error) {
    console.error('Error al actualizar la organización:', error);
    return res.status(500).json({ message: 'Error al actualizar la organización' });
  }
};

// Eliminar una organización
exports.deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Eliminar la imagen principal si existe
    if (organization.mainImage) {
      const imagePath = path.join(__dirname, '../public/uploads/organizations', organization.mainImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await organization.destroy();
    
    return res.status(200).json({ message: 'Organización eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la organización:', error);
    return res.status(500).json({ message: 'Error al eliminar la organización' });
  }
}; 