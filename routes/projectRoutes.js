const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para proyectos destacados (deben ir antes de las rutas con parámetros)
router.get('/featured/list', projectController.getFeaturedProjects);

// Rutas para proyectos por categoría y organización (deben ir antes de las rutas con :id)
router.get('/category/:categoryId', projectController.getProjectsByCategory);
router.get('/organization/:organizationId', projectController.getProjectsByOrganization);

// Rutas CRUD básicas para proyectos
router.get('/', projectController.getAllProjects);
router.post('/', projectController.createProject);

// Rutas específicas para un proyecto por ID
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);
router.put('/:id/toggle-featured', projectController.toggleFeaturedProject);
router.put('/:id/categories', projectController.manageProjectCategories);

module.exports = router; 