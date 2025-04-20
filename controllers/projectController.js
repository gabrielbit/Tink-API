const { Project, Category, Organization } = require('../models/associations');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Obtener todos los proyectos con filtros y ordenamiento
exports.getAllProjects = async (req, res) => {
  try {
    const {
      title,
      organizationId,
      country,
      categoryId,
      startDate,
      endDate,
      featured,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      limit = 10,
      page = 1
    } = req.query;
    
    // Construir el objeto de filtros
    const filters = {};
    
    if (title) {
      filters.title = { [Op.like]: `%${title}%` };
    }
    
    if (organizationId) {
      filters.organizationId = organizationId;
    }
    
    if (country) {
      filters.country = { [Op.like]: `%${country}%` };
    }
    
    if (startDate) {
      filters.startDate = { [Op.gte]: new Date(startDate) };
    }
    
    if (endDate) {
      filters.endDate = { [Op.lte]: new Date(endDate) };
    }
    
    if (featured !== undefined) {
      filters.featured = featured === 'true';
    }
    
    // Opciones de consulta
    const options = {
      where: filters,
      include: [
        {
          model: Organization,
          as: 'organization'
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };
    
    // Si se filtra por categoría, se debe usar un enfoque diferente
    if (categoryId) {
      options.include[1].where = { id: categoryId };
    }
    
    // Ejecutar consulta con filtros y ordenamiento
    const { count, rows: projects } = await Project.findAndCountAll(options);
    
    // Calcular total de páginas
    const totalPages = Math.ceil(count / parseInt(limit));
    
    return res.status(200).json({
      projects,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    return res.status(500).json({ message: 'Error al obtener proyectos' });
  }
};

// Obtener un proyecto por ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: Organization,
          as: 'organization'
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    return res.status(200).json(project);
  } catch (error) {
    console.error('Error al obtener el proyecto:', error);
    return res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
};

// Crear un nuevo proyecto
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      maxAmount,
      country,
      city,
      expectedImpact,
      organizationId,
      categoryIds,
      featured
    } = req.body;
    
    // Validación básica
    if (!title || !description || !startDate || !country || !city || !organizationId) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    
    // Verificar que la organización existe
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'La organización no existe' });
    }
    
    // Crear el proyecto
    const newProject = await Project.create({
      title,
      description,
      startDate,
      endDate,
      maxAmount,
      country,
      city,
      expectedImpact,
      organizationId,
      featured: featured || false
    });
    
    // Si se proporcionaron categorías, asociarlas al proyecto
    if (categoryIds && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: {
          id: {
            [Op.in]: categoryIds
          }
        }
      });
      
      await newProject.setCategories(categories);
    }
    
    // Obtener el proyecto completo con sus relaciones
    const projectWithRelations = await Project.findByPk(newProject.id, {
      include: [
        {
          model: Organization,
          as: 'organization'
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ]
    });
    
    return res.status(201).json(projectWithRelations);
  } catch (error) {
    console.error('Error al crear el proyecto:', error);
    return res.status(500).json({ message: 'Error al crear el proyecto' });
  }
};

// Actualizar un proyecto
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    const {
      title,
      description,
      startDate,
      endDate,
      maxAmount,
      country,
      city,
      expectedImpact,
      organizationId,
      categoryIds,
      featured
    } = req.body;
    
    // Si se proporciona organizationId, verificar que la organización existe
    if (organizationId) {
      const organization = await Organization.findByPk(organizationId);
      if (!organization) {
        return res.status(404).json({ message: 'La organización no existe' });
      }
    }
    
    // Actualizar los campos del proyecto
    await project.update({
      title: title || project.title,
      description: description || project.description,
      startDate: startDate || project.startDate,
      endDate: endDate !== undefined ? endDate : project.endDate,
      maxAmount: maxAmount !== undefined ? maxAmount : project.maxAmount,
      country: country || project.country,
      city: city || project.city,
      expectedImpact: expectedImpact !== undefined ? expectedImpact : project.expectedImpact,
      organizationId: organizationId || project.organizationId,
      featured: featured !== undefined ? featured : project.featured
    });
    
    // Si se proporcionaron categorías, actualizar las asociaciones
    if (categoryIds && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: {
          id: {
            [Op.in]: categoryIds
          }
        }
      });
      
      await project.setCategories(categories);
    }
    
    // Obtener el proyecto actualizado con sus relaciones
    const updatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: Organization,
          as: 'organization'
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ]
    });
    
    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error al actualizar el proyecto:', error);
    return res.status(500).json({ message: 'Error al actualizar el proyecto' });
  }
};

// Eliminar un proyecto
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    await project.destroy();
    
    return res.status(200).json({ message: 'Proyecto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el proyecto:', error);
    return res.status(500).json({ message: 'Error al eliminar el proyecto' });
  }
};

// NUEVOS MÉTODOS

// Obtener proyectos por categoría
exports.getProjectsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const { limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    
    // Verificar que la categoría existe
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    // Buscar proyectos por categoría
    const { count, rows: projects } = await Project.findAndCountAll({
      include: [
        {
          model: Organization,
          as: 'organization'
        },
        {
          model: Category,
          as: 'categories',
          where: { id: categoryId },
          through: { attributes: [] }
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true
    });
    
    // Calcular total de páginas
    const totalPages = Math.ceil(count / parseInt(limit));
    
    return res.status(200).json({
      category: {
        id: category.id,
        name: category.name
      },
      projects,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos por categoría:', error);
    return res.status(500).json({ message: 'Error al obtener proyectos por categoría' });
  }
};

// Obtener proyectos por organización
exports.getProjectsByOrganization = async (req, res) => {
  try {
    const organizationId = req.params.organizationId;
    const { limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    
    // Verificar que la organización existe
    const organization = await Organization.findByPk(organizationId);
    if (!organization) {
      return res.status(404).json({ message: 'Organización no encontrada' });
    }
    
    // Buscar proyectos por organización
    const { count, rows: projects } = await Project.findAndCountAll({
      where: { organizationId },
      include: [
        {
          model: Organization,
          as: 'organization'
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    return res.status(200).json({
      organization,
      projects,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos por organización:', error);
    return res.status(500).json({ message: 'Error al obtener proyectos por organización' });
  }
};

// Obtener proyectos destacados
exports.getFeaturedProjects = async (req, res) => {
  try {
    const { limit = 10, page = 1, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
    
    // Buscar proyectos destacados
    const { count, rows: projects } = await Project.findAndCountAll({
      where: { featured: true },
      include: [
        {
          model: Organization,
          as: 'organization'
        },
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });
    
    // Calcular total de páginas
    const totalPages = Math.ceil(count / parseInt(limit));
    
    return res.status(200).json({
      projects,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener proyectos destacados:', error);
    return res.status(500).json({ message: 'Error al obtener proyectos destacados' });
  }
};

// Destacar o quitar destaque de un proyecto
exports.toggleFeaturedProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    // Cambiar el estado de destacado
    const featured = !project.featured;
    await project.update({ featured });
    
    return res.status(200).json({
      id: project.id,
      featured,
      message: featured ? 'Proyecto destacado correctamente' : 'Proyecto quitado de destacados correctamente'
    });
  } catch (error) {
    console.error('Error al destacar/quitar destacado del proyecto:', error);
    return res.status(500).json({ message: 'Error al actualizar estado de destacado del proyecto' });
  }
};

// Administrar categorías de un proyecto (agregar/quitar)
exports.manageProjectCategories = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { categoryIds, action } = req.body;
    
    if (!['add', 'remove', 'set'].includes(action)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Acción no válida. Debe ser "add", "remove" o "set"' });
    }
    
    if (!categoryIds || !Array.isArray(categoryIds) || categoryIds.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Debe proporcionar al menos una categoría' });
    }
    
    // Verificar que el proyecto existe
    const project = await Project.findByPk(id, { transaction });
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    // Verificar que las categorías existen
    const categories = await Category.findAll({
      where: { id: { [Op.in]: categoryIds } },
      transaction
    });
    
    if (categories.length !== categoryIds.length) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Una o más categorías no existen' });
    }
    
    // Realizar la acción correspondiente
    if (action === 'add') {
      await project.addCategories(categories, { transaction });
    } else if (action === 'remove') {
      await project.removeCategories(categories, { transaction });
    } else if (action === 'set') {
      await project.setCategories(categories, { transaction });
    }
    
    // Obtener el proyecto actualizado con sus categorías
    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categories',
          through: { attributes: [] }
        }
      ],
      transaction
    });
    
    await transaction.commit();
    
    return res.status(200).json({
      message: 'Categorías actualizadas correctamente',
      project: {
        id: updatedProject.id,
        title: updatedProject.title,
        categories: updatedProject.categories
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al gestionar categorías del proyecto:', error);
    return res.status(500).json({ message: 'Error al gestionar categorías del proyecto' });
  }
}; 