const { Project, Category, Organization } = require('../models/associations');
const { Op } = require('sequelize');

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
    
    // Opciones de consulta
    const options = {
      where: filters,
      include: [
        {
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
          through: { attributes: [] } // No incluir atributos de la tabla pivote
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
          as: 'organization',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
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
      categoryIds
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
      organizationId
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
          as: 'organization',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
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
      categoryIds
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
      organizationId: organizationId || project.organizationId
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
          as: 'organization',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name'],
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