const { Category, Project } = require('../models/associations');
const { Op } = require('sequelize');

// Obtener todas las categorías
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

// Obtener una categoría por ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'projects',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    return res.status(200).json(category);
  } catch (error) {
    console.error('Error al obtener la categoría:', error);
    return res.status(500).json({ message: 'Error al obtener la categoría' });
  }
};

// Crear una nueva categoría
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validación básica
    if (!name) {
      return res.status(400).json({ message: 'El nombre de la categoría es obligatorio' });
    }
    
    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategory = await Category.findOne({
      where: {
        name: {
          [Op.iLike]: name
        }
      }
    });
    
    if (existingCategory) {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }
    
    // Crear la categoría
    const newCategory = await Category.create({
      name,
      description
    });
    
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error al crear la categoría:', error);
    return res.status(500).json({ message: 'Error al crear la categoría' });
  }
};

// Actualizar una categoría
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    const { name, description } = req.body;
    
    // Si se cambió el nombre, verificar que no exista otra categoría con ese nombre
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name: {
            [Op.iLike]: name
          },
          id: {
            [Op.ne]: category.id
          }
        }
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Ya existe otra categoría con ese nombre' });
      }
    }
    
    // Actualizar la categoría
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description
    });
    
    return res.status(200).json(category);
  } catch (error) {
    console.error('Error al actualizar la categoría:', error);
    return res.status(500).json({ message: 'Error al actualizar la categoría' });
  }
};

// Eliminar una categoría
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }
    
    // Verificar si hay proyectos asociados a esta categoría
    const projectCount = await category.countProjects();
    
    if (projectCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar la categoría porque hay proyectos asociados a ella',
        projectCount
      });
    }
    
    await category.destroy();
    
    return res.status(200).json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar la categoría:', error);
    return res.status(500).json({ message: 'Error al eliminar la categoría' });
  }
}; 