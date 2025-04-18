const Organization = require('../models/Organization');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// URL base para las imágenes
const getBaseUrl = (req) => {
  return `${req.protocol}://${req.get('host')}`;
};

// Función para agregar URLs completas a las organizaciones
const addImageUrls = (organizations, baseUrl) => {
  if (Array.isArray(organizations)) {
    return organizations.map(org => addImageUrlsToOrg(org, baseUrl));
  }
  return addImageUrlsToOrg(organizations, baseUrl);
};

// Función para agregar URLs completas a una organización
const addImageUrlsToOrg = (org, baseUrl) => {
  const organization = org.toJSON ? org.toJSON() : { ...org };
  
  // Agregar URL completa para mainImage si existe
  if (organization.mainImage) {
    organization.mainImageUrl = `${baseUrl}/uploads/organizations/${organization.mainImage}`;
  }
  
  return organization;
};

// Obtener todas las organizaciones con filtros y ordenamiento
exports.getAllOrganizations = async (req, res) => {
  try {
    const {
      name,
      responsibleName,
      responsibleEmail,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      limit = 10,
      page = 1
    } = req.query;
    
    // Construir el objeto de filtros
    const filters = {};
    
    if (name) {
      filters.name = { [Op.like]: `%${name}%` };
    }
    
    if (responsibleName) {
      filters.responsibleName = { [Op.like]: `%${responsibleName}%` };
    }
    
    if (responsibleEmail) {
      filters.responsibleEmail = { [Op.like]: `%${responsibleEmail}%` };
    }
    
    // Calcular offset para paginación
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Validar campo de ordenamiento
    const validSortFields = [
      'name', 
      'responsibleName', 
      'responsibleEmail', 
      'createdAt', 
      'updatedAt'
    ];
    
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    console.log('Ejecutando consulta con filtros:', JSON.stringify(filters));
    
    // Ejecutar consulta con filtros y ordenamiento
    const { count, rows: organizations } = await Organization.findAndCountAll({
      where: filters,
      order: [[orderField, orderDirection]],
      limit: parseInt(limit),
      offset: offset
    });
    
    console.log(`Se encontraron ${count} organizaciones`);
    
    // Calcular total de páginas
    const totalPages = Math.ceil(count / parseInt(limit));
    
    // Añadir URLs completas de imágenes
    const baseUrl = getBaseUrl(req);
    const orgsWithUrls = addImageUrls(organizations, baseUrl);
    
    return res.status(200).json({
      organizations: orgsWithUrls,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener organizaciones:', error);
    return res.status(500).json({ message: 'Error al obtener organizaciones' });
  }
};

// Obtener una organización por ID
exports.getOrganizationById = async (req, res) => {
  try {
    const organization = await Organization.findByPk(req.params.id);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Añadir URLs completas de imágenes
    const baseUrl = getBaseUrl(req);
    const orgWithUrls = addImageUrls(organization, baseUrl);
    
    return res.status(200).json(orgWithUrls);
  } catch (error) {
    console.error('Error al obtener la organización:', error);
    return res.status(500).json({ message: 'Error al obtener la organización' });
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
    
    // Añadir URLs completas de imágenes
    const baseUrl = getBaseUrl(req);
    const orgWithUrls = addImageUrls(newOrganization, baseUrl);
    
    return res.status(201).json(orgWithUrls);
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
    
    // Añadir URLs completas de imágenes
    const baseUrl = getBaseUrl(req);
    const orgWithUrls = addImageUrls(organization, baseUrl);
    
    return res.status(200).json(orgWithUrls);
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